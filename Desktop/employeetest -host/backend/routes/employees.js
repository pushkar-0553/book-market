import { Router } from 'express';
import pool from '../config/db.js';
import upload from '../middleware/upload.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

// Apply auth middleware to all employee routes
router.use(verifyToken);

// ---------- Helper: convert multer buffer → data URL ----------
function bufferToDataUrl(file) {
  if (!file || !file.buffer) return null;
  const base64 = file.buffer.toString('base64');
  return `data:${file.mimetype};base64,${base64}`;
}

// ---------- Helper: generate EMP ID ----------
async function generateEmpId() {
  const year = new Date().getFullYear();
  const [rows] = await pool.query(
    'SELECT emp_id FROM employees WHERE emp_id LIKE ? ORDER BY id DESC LIMIT 1',
    [`EMP${year}%`]
  );

  if (rows.length === 0) {
    return `EMP${year}001`;
  }

  const lastNum = parseInt(rows[0].emp_id.replace(`EMP${year}`, ''), 10);
  const nextNum = String(lastNum + 1).padStart(3, '0');
  return `EMP${year}${nextNum}`;
}

// ---------- Validate employee fields ----------
function validateEmployee(body, isUpdate = false) {
  const errors = [];
  const required = [
    'first_name', 'last_name', 'role', 'dob',
    'date_of_joining', 'current_address', 'permanent_address', 'blood_group', 'phone_number'
  ];

  for (const field of required) {
    if (!body[field] || String(body[field]).trim() === '') {
      errors.push(`${field.replace(/_/g, ' ')} is required.`);
    }
  }

  const nameRegex = /^[a-zA-Z\s]+$/;
  if (body.first_name && !nameRegex.test(body.first_name)) errors.push('First Name must contain only letters.');
  if (body.last_name && !nameRegex.test(body.last_name)) errors.push('Last Name must contain only letters.');
  if (body.middle_name && !nameRegex.test(body.middle_name)) errors.push('Middle Name must contain only letters.');
  
  const phoneRegex = /^\d{10}$/;
  if (body.phone_number && !phoneRegex.test(body.phone_number)) {
     errors.push('Phone Number must be exactly 10 digits.');
  }

  if (body.dob && body.date_of_joining) {
    const dob = new Date(body.dob);
    const join = new Date(body.date_of_joining);
    const age = new Date().getFullYear() - dob.getFullYear();
    if (age < 18) errors.push('Employee must be at least 18 years old.');
    if (join <= dob) errors.push('Joining Date must be after Date of Birth.');
  }

  return errors;
}

// ---------- GET /api/employees ----------
router.get('/', async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10, status = 'true' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = 'SELECT * FROM employees';
    let countQuery = 'SELECT COUNT(*) as total FROM employees';
    const params = [];
    const countParams = [];

    // Filter by status if not 'all'
    if (status !== 'all') {
      const isStatusTrue = status === 'true';
      query += ' WHERE status = ?';
      countQuery += ' WHERE status = ?';
      params.push(isStatusTrue);
      countParams.push(isStatusTrue);
    } else {
       if (search) {
         query += ' WHERE (1=1)'; 
         countQuery += ' WHERE (1=1)';
       }
    }

    if (search) {
      const searchClause = ` AND (first_name LIKE ? OR last_name LIKE ? OR emp_id LIKE ? OR role LIKE ? OR nick_name LIKE ?)`;
      const searchParam = `%${search}%`;
      query += searchClause;
      countQuery += searchClause;
      params.push(searchParam, searchParam, searchParam, searchParam, searchParam);
      countParams.push(searchParam, searchParam, searchParam, searchParam, searchParam);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [rows] = await pool.query(query, params);
    const [countRows] = await pool.query(countQuery, countParams);

    res.json({
      employees: rows,
      total: countRows[0].total,
      page: parseInt(page),
      totalPages: Math.ceil(countRows[0].total / parseInt(limit)),
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Server error while fetching employees.' });
  }
});

// ---------- GET /api/employees/:id ----------
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM employees WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Employee not found.' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ---------- POST /api/employees ----------
router.post('/', upload.single('profile_picture'), async (req, res) => {
  try {
    const errors = validateEmployee(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ message: errors.join(' ') });
    }

    const empId = await generateEmpId();
    const {
      first_name, middle_name, last_name, role, dob,
      date_of_joining, nick_name, current_address, permanent_address, blood_group, phone_number
    } = req.body;

    // Convert uploaded file to base64 data URL
    const profilePicture = bufferToDataUrl(req.file);

    await pool.query(
      `INSERT INTO employees 
        (emp_id, first_name, middle_name, last_name, role, dob, date_of_joining, nick_name, current_address, permanent_address, blood_group, phone_number, profile_picture, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [empId, first_name, middle_name || null, last_name, role, dob, date_of_joining, nick_name || null, current_address, permanent_address, blood_group, phone_number, profilePicture]
    );

    res.status(201).json({ message: 'Employee created successfully.', empId });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ message: 'Server error while creating employee.' });
  }
});

// ---------- PUT /api/employees/:id/exit ----------
router.put('/:id/exit', async (req, res) => {
  try {
    const { exit_date, exit_reason } = req.body;
    if (!exit_date) {
      return res.status(400).json({ message: 'Exit Date is required.' });
    }

    await pool.query(
      'UPDATE employees SET status = 0, exit_date = ?, exit_reason = ? WHERE id = ?',
      [exit_date, exit_reason || null, req.params.id]
    );

    res.json({ message: 'Employee marked as INACTIVE successfully.' });
  } catch (error) {
    console.error('Error marking employee as EXITED:', error);
    res.status(500).json({ message: 'Server error while updating status.' });
  }
});

// ---------- PUT /api/employees/:id/restore ----------
router.put('/:id/restore', async (req, res) => {
  try {
    await pool.query(
      'UPDATE employees SET status = 1, exit_date = NULL, exit_reason = NULL WHERE id = ?',
      [req.params.id]
    );
    res.json({ message: 'Employee restored successfully.' });
  } catch (error) {
    console.error('Error restoring employee:', error);
    res.status(500).json({ message: 'Server error while restoring employee.' });
  }
});

// ---------- PUT /api/employees/:id ----------
router.put('/:id', upload.single('profile_picture'), async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT * FROM employees WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    const errors = validateEmployee(req.body, true);
    if (errors.length > 0) {
      return res.status(400).json({ message: errors.join(' ') });
    }

    const {
      first_name, middle_name, last_name, role, dob,
      date_of_joining, nick_name, current_address, permanent_address, blood_group,
      phone_number, exit_date, exit_reason 
    } = req.body;

    // Keep existing picture unless a new one is uploaded
    let profilePicture = existing[0].profile_picture;
    if (req.file) {
      profilePicture = bufferToDataUrl(req.file);
    }

    await pool.query(
      `UPDATE employees SET
        first_name = ?, middle_name = ?, last_name = ?, role = ?, dob = ?,
        date_of_joining = ?, nick_name = ?, current_address = ?, permanent_address = ?,
        blood_group = ?, phone_number = ?, profile_picture = ?,
        exit_date = ?, exit_reason = ?
       WHERE id = ?`,
      [first_name, middle_name || null, last_name, role, dob, date_of_joining, nick_name || null, current_address, permanent_address, blood_group, phone_number, profilePicture, exit_date || null, exit_reason || null, req.params.id]
    );

    res.json({ message: 'Employee updated successfully.' });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ message: 'Server error while updating employee.' });
  }
});

// ---------- DELETE /api/employees/:id (Soft-delete/Inactive) ----------
router.delete('/:id', async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT * FROM employees WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    // Set status to 0 (Inactive) instead of deleting
    await pool.query(
      'UPDATE employees SET status = 0, exit_date = CURRENT_DATE, exit_reason = "Deleted by User" WHERE id = ?',
      [req.params.id]
    );

    res.json({ message: 'Employee marked as INACTIVE (false).' });
  } catch (error) {
    console.error('Error "deleting" employee:', error);
    res.status(500).json({ message: 'Server error while deleting employee.' });
  }
});

export default router;
