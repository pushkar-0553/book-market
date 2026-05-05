// BooksContext — Google Sheets CSV + mock fallback
// RULE: Common branch = Year 1 only. All other branches = Years 2, 3, 4 only.
import { createContext, useContext, useState, useEffect } from 'react';
import Papa from 'papaparse';

const BooksContext = createContext(null);
const SHEET_ID = '1t9TuV4esxRbgNmskZ-IFUhrVKGgajBng';
const SHEET_CSV_URL = import.meta.env.DEV
  ? `/sheets-proxy/spreadsheets/d/${SHEET_ID}/export?format=csv&id=${SHEET_ID}`
  : `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&id=${SHEET_ID}`;

/** Which years to show for a given branch */
export function getValidYears(branch) {
  return branch?.toLowerCase() === 'common' ? ['1'] : ['2', '3', '4'];
}

const MOCK_BOOKS = [
  // ── Common (Year 1 only) ──────────────────────────────────────────────────
  { BookID:'B101',Category:'BTEC',Branch:'Common',Year:'1',SubjectName:'Mathematics - I',FullBookName:'MATHEMATICS – I',AuthorName:'B.S. Grewal',Price:'1179',ImageURL:'https://m.media-amazon.com/images/I/71bMQUPpVEL._SY445_.jpg',SemRaw:'Semester-1' },
  { BookID:'B102',Category:'BTEC',Branch:'Common',Year:'1',SubjectName:'Chemistry',FullBookName:'CHEMISTRY',AuthorName:'P.W. Atkins',Price:'759',ImageURL:'https://m.media-amazon.com/images/I/71YMa7tMkEL._SY445_.jpg',SemRaw:'Semester-1' },
  { BookID:'B103',Category:'BTEC',Branch:'Common',Year:'1',SubjectName:'Basic Electrical Engineering',FullBookName:'BASIC ELECTRICAL ENGINEERING',AuthorName:'D.P. Kothari',Price:'830',ImageURL:'https://m.media-amazon.com/images/I/71U2eMWR6tL._SY445_.jpg',SemRaw:'Semester-1' },
  { BookID:'B104',Category:'BTEC',Branch:'Common',Year:'1',SubjectName:'Engineering Workshop',FullBookName:'ENGINEERING WORKSHOP',AuthorName:'N.D. Bhatt',Price:'375',ImageURL:'https://m.media-amazon.com/images/I/71ZEX8aKiOL._SY445_.jpg',SemRaw:'Semester-1' },
  { BookID:'B105',Category:'BTEC',Branch:'Common',Year:'1',SubjectName:'English',FullBookName:'ENGLISH',AuthorName:'Sudarshana',Price:'210',ImageURL:'https://m.media-amazon.com/images/I/71JFmkUPL9L._SY445_.jpg',SemRaw:'Semester-1' },
  { BookID:'B106',Category:'BTEC',Branch:'Common',Year:'1',SubjectName:'Mathematics - II',FullBookName:'MATHEMATICS – II',AuthorName:'Ervin Kreyszig',Price:'1695',ImageURL:'https://m.media-amazon.com/images/I/71rQs4PEXAL._SY445_.jpg',SemRaw:'Semester-2' },
  { BookID:'B107',Category:'BTEC',Branch:'Common',Year:'1',SubjectName:'Applied Physics',FullBookName:'APPLIED PHYSICS',AuthorName:'B.K. Pandey',Price:'975',ImageURL:'https://m.media-amazon.com/images/I/71A7WRFqtLL._SY445_.jpg',SemRaw:'Semester-2' },
  { BookID:'B108',Category:'BTEC',Branch:'Common',Year:'1',SubjectName:'Programming for Problem Solving',FullBookName:'PROGRAMMING FOR PROBLEM SOLVING',AuthorName:'Byron Gottfried',Price:'1235',ImageURL:'https://m.media-amazon.com/images/I/71nfQVMnlvL._SY445_.jpg',SemRaw:'Semester-2' },
  { BookID:'B109',Category:'BTEC',Branch:'Common',Year:'1',SubjectName:'Engineering Graphics',FullBookName:'ENGINEERING GRAPHICS',AuthorName:'N.D. Bhatt',Price:'595',ImageURL:'',SemRaw:'Semester-2' },
  { BookID:'B110',Category:'BTEC',Branch:'Common',Year:'1',SubjectName:'Environmental Science',FullBookName:'ENVIRONMENTAL SCIENCE',AuthorName:'Erach Bharucha',Price:'550',ImageURL:'',SemRaw:'Semester-2' },
  // ── CSE (Years 2, 3, 4) ──────────────────────────────────────────────────
  { BookID:'C201',Category:'BTEC',Branch:'CSE',Year:'2',SubjectName:'Data Structures',FullBookName:'DATA STRUCTURES AND ALGORITHMS',AuthorName:'Mark Allen Weiss',Price:'899',ImageURL:'https://m.media-amazon.com/images/I/71r56bICp7L._SY445_.jpg',SemRaw:'Semester-3' },
  { BookID:'C202',Category:'BTEC',Branch:'CSE',Year:'2',SubjectName:'Discrete Mathematics',FullBookName:'DISCRETE MATHEMATICS',AuthorName:'Kenneth Rosen',Price:'1250',ImageURL:'https://m.media-amazon.com/images/I/71pJLdJpMQL._SY445_.jpg',SemRaw:'Semester-3' },
  { BookID:'C203',Category:'BTEC',Branch:'CSE',Year:'2',SubjectName:'Digital Logic Design',FullBookName:'DIGITAL LOGIC AND COMPUTER DESIGN',AuthorName:'Morris Mano',Price:'750',ImageURL:'https://m.media-amazon.com/images/I/712mR8UYCKL._SY445_.jpg',SemRaw:'Semester-3' },
  { BookID:'C204',Category:'BTEC',Branch:'CSE',Year:'2',SubjectName:'OOP (C++/Java)',FullBookName:'OBJECT ORIENTED PROGRAMMING IN C++',AuthorName:'E. Balagurusamy',Price:'499',ImageURL:'https://m.media-amazon.com/images/I/71L+qXy6KLL._SY445_.jpg',SemRaw:'Semester-3' },
  { BookID:'C205',Category:'BTEC',Branch:'CSE',Year:'2',SubjectName:'Operating Systems',FullBookName:'OPERATING SYSTEM CONCEPTS',AuthorName:'Abraham Silberschatz',Price:'1099',ImageURL:'https://m.media-amazon.com/images/I/51Qy2upM+aL._SY445_.jpg',SemRaw:'Semester-4' },
  { BookID:'C206',Category:'BTEC',Branch:'CSE',Year:'2',SubjectName:'Computer Organization',FullBookName:'COMPUTER ORGANIZATION AND ARCHITECTURE',AuthorName:'William Stallings',Price:'999',ImageURL:'https://m.media-amazon.com/images/I/71pXwCEQjNL._SY445_.jpg',SemRaw:'Semester-4' },
  { BookID:'C207',Category:'BTEC',Branch:'CSE',Year:'2',SubjectName:'Database Management Systems',FullBookName:'DATABASE SYSTEM CONCEPTS',AuthorName:'Korth',Price:'1150',ImageURL:'https://m.media-amazon.com/images/I/71GxzFpRCPL._SY445_.jpg',SemRaw:'Semester-4' },
  { BookID:'C208',Category:'BTEC',Branch:'CSE',Year:'2',SubjectName:'Software Engineering',FullBookName:'SOFTWARE ENGINEERING: A PRACTITIONER\'S APPROACH',AuthorName:'Roger Pressman',Price:'980',ImageURL:'',SemRaw:'Semester-4' },
  { BookID:'C301',Category:'BTEC',Branch:'CSE',Year:'3',SubjectName:'Computer Networks',FullBookName:'COMPUTER NETWORKS',AuthorName:'Andrew Tanenbaum',Price:'1200',ImageURL:'https://m.media-amazon.com/images/I/71GxzFpRCPL._SY445_.jpg',SemRaw:'Semester-5' },
  { BookID:'C302',Category:'BTEC',Branch:'CSE',Year:'3',SubjectName:'Design & Analysis of Algorithms',FullBookName:'INTRODUCTION TO ALGORITHMS',AuthorName:'CLRS',Price:'1350',ImageURL:'https://m.media-amazon.com/images/I/61Pgdn8Ys-L._SY445_.jpg',SemRaw:'Semester-5' },
  { BookID:'C303',Category:'BTEC',Branch:'CSE',Year:'3',SubjectName:'Compiler Design',FullBookName:'COMPILERS: PRINCIPLES, TECHNIQUES AND TOOLS',AuthorName:'Alfred Aho',Price:'1150',ImageURL:'https://m.media-amazon.com/images/I/71pJLdJpMQL._SY445_.jpg',SemRaw:'Semester-5' },
  { BookID:'C304',Category:'BTEC',Branch:'CSE',Year:'3',SubjectName:'Artificial Intelligence',FullBookName:'ARTIFICIAL INTELLIGENCE: A MODERN APPROACH',AuthorName:'Russell & Norvig',Price:'1499',ImageURL:'https://m.media-amazon.com/images/I/51IpVHFkfxL._SY445_.jpg',SemRaw:'Semester-6' },
  { BookID:'C305',Category:'BTEC',Branch:'CSE',Year:'3',SubjectName:'Machine Learning',FullBookName:'PATTERN RECOGNITION AND MACHINE LEARNING',AuthorName:'Christopher Bishop',Price:'1299',ImageURL:'https://m.media-amazon.com/images/I/71r56bICp7L._SY445_.jpg',SemRaw:'Semester-6' },
  { BookID:'C306',Category:'BTEC',Branch:'CSE',Year:'3',SubjectName:'Web Technologies',FullBookName:'LEARNING WEB DESIGN',AuthorName:'Jennifer Robbins',Price:'699',ImageURL:'',SemRaw:'Semester-6' },
  { BookID:'C401',Category:'BTEC',Branch:'CSE',Year:'4',SubjectName:'Cloud Computing',FullBookName:'CLOUD COMPUTING: CONCEPTS, TECHNOLOGY & ARCHITECTURE',AuthorName:'Thomas Erl',Price:'799',ImageURL:'https://m.media-amazon.com/images/I/71L+qXy6KLL._SY445_.jpg',SemRaw:'Semester-7' },
  { BookID:'C402',Category:'BTEC',Branch:'CSE',Year:'4',SubjectName:'Information Security',FullBookName:'CRYPTOGRAPHY AND NETWORK SECURITY',AuthorName:'William Stallings',Price:'1050',ImageURL:'https://m.media-amazon.com/images/I/71pXwCEQjNL._SY445_.jpg',SemRaw:'Semester-7' },
  { BookID:'C403',Category:'BTEC',Branch:'CSE',Year:'4',SubjectName:'Big Data Analytics',FullBookName:'BIG DATA: A REVOLUTION',AuthorName:'Viktor Mayer-Schönberger',Price:'650',ImageURL:'',SemRaw:'Semester-8' },
  // ── Civil (Years 2, 3, 4) ─────────────────────────────────────────────────
  { BookID:'CV201',Category:'BTEC',Branch:'Civil',Year:'2',SubjectName:'Strength of Materials',FullBookName:'STRENGTH OF MATERIALS',AuthorName:'R.K. Bansal',Price:'713',ImageURL:'https://m.media-amazon.com/images/I/71Jt7pSTj2L._SY445_.jpg',SemRaw:'Semester-3' },
  { BookID:'CV202',Category:'BTEC',Branch:'Civil',Year:'2',SubjectName:'Surveying',FullBookName:'SURVEYING',AuthorName:'R.C. Punmia',Price:'520',ImageURL:'',SemRaw:'Semester-3' },
  { BookID:'CV203',Category:'BTEC',Branch:'Civil',Year:'2',SubjectName:'Fluid Mechanics',FullBookName:'FLUID MECHANICS',AuthorName:'R.K. Rajput',Price:'1528',ImageURL:'',SemRaw:'Semester-4' },
  { BookID:'CV204',Category:'BTEC',Branch:'Civil',Year:'2',SubjectName:'Building Materials',FullBookName:'BUILDING MATERIALS',AuthorName:'K.K. Chitale',Price:'595',ImageURL:'',SemRaw:'Semester-4' },
  { BookID:'CV301',Category:'BTEC',Branch:'Civil',Year:'3',SubjectName:'Structural Analysis I',FullBookName:'STRUCTURAL ANALYSIS',AuthorName:'R.C. Hibbeler',Price:'1270',ImageURL:'https://m.media-amazon.com/images/I/71pXwCEQjNL._SY445_.jpg',SemRaw:'Semester-5' },
  { BookID:'CV302',Category:'BTEC',Branch:'Civil',Year:'3',SubjectName:'Geotechnical Engineering',FullBookName:'GEOTECHNICAL ENGINEERING',AuthorName:'K.R. Arora',Price:'950',ImageURL:'',SemRaw:'Semester-5' },
  { BookID:'CV303',Category:'BTEC',Branch:'Civil',Year:'3',SubjectName:'Transportation Engineering',FullBookName:'TRANSPORTATION ENGINEERING',AuthorName:'Khanna & Justo',Price:'375',ImageURL:'',SemRaw:'Semester-6' },
  { BookID:'CV401',Category:'BTEC',Branch:'Civil',Year:'4',SubjectName:'Advanced Structural Design',FullBookName:'ADVANCED STRUCTURAL DESIGN',AuthorName:'Pillai & Menon',Price:'1165',ImageURL:'',SemRaw:'Semester-7' },
  { BookID:'CV402',Category:'BTEC',Branch:'Civil',Year:'4',SubjectName:'Estimation & Costing',FullBookName:'ESTIMATION & COSTING',AuthorName:'B.N. Dutta',Price:'651',ImageURL:'',SemRaw:'Semester-7' },
  // ── Mechanical (Years 2, 3, 4) ────────────────────────────────────────────
  { BookID:'ME201',Category:'BTEC',Branch:'Mechanical',Year:'2',SubjectName:'Engineering Thermodynamics',FullBookName:'ENGINEERING THERMODYNAMICS',AuthorName:'P.K. Nag',Price:'875',ImageURL:'https://m.media-amazon.com/images/I/71YMa7tMkEL._SY445_.jpg',SemRaw:'Semester-3' },
  { BookID:'ME202',Category:'BTEC',Branch:'Mechanical',Year:'2',SubjectName:'Manufacturing Technology',FullBookName:'MANUFACTURING TECHNOLOGY',AuthorName:'P.N. Rao',Price:'750',ImageURL:'',SemRaw:'Semester-3' },
  { BookID:'ME203',Category:'BTEC',Branch:'Mechanical',Year:'2',SubjectName:'Fluid Mechanics & Machinery',FullBookName:'FLUID MECHANICS AND HYDRAULIC MACHINES',AuthorName:'R.K. Bansal',Price:'935',ImageURL:'https://m.media-amazon.com/images/I/71r56bICp7L._SY445_.jpg',SemRaw:'Semester-4' },
  { BookID:'ME204',Category:'BTEC',Branch:'Mechanical',Year:'2',SubjectName:'Theory of Machines',FullBookName:'THEORY OF MACHINES',AuthorName:'S.S. Rattan',Price:'699',ImageURL:'',SemRaw:'Semester-4' },
  { BookID:'ME301',Category:'BTEC',Branch:'Mechanical',Year:'3',SubjectName:'Machine Design',FullBookName:'MACHINE DESIGN',AuthorName:'V.B. Bhandari',Price:'849',ImageURL:'',SemRaw:'Semester-5' },
  { BookID:'ME302',Category:'BTEC',Branch:'Mechanical',Year:'3',SubjectName:'Heat & Mass Transfer',FullBookName:'HEAT AND MASS TRANSFER',AuthorName:'Cengel & Ghajar',Price:'1250',ImageURL:'',SemRaw:'Semester-6' },
  { BookID:'ME401',Category:'BTEC',Branch:'Mechanical',Year:'4',SubjectName:'Automobile Engineering',FullBookName:'AUTOMOBILE ENGINEERING',AuthorName:'R.B. Gupta',Price:'599',ImageURL:'',SemRaw:'Semester-7' },
  // ── EEE (Years 2, 3, 4) ───────────────────────────────────────────────────
  { BookID:'EE201',Category:'BTEC',Branch:'EEE',Year:'2',SubjectName:'Electric Circuits',FullBookName:'ELECTRIC CIRCUITS',AuthorName:'Joseph Edminister',Price:'549',ImageURL:'https://m.media-amazon.com/images/I/71JFmkUPL9L._SY445_.jpg',SemRaw:'Semester-3' },
  { BookID:'EE202',Category:'BTEC',Branch:'EEE',Year:'2',SubjectName:'Electromagnetic Fields',FullBookName:'ENGINEERING ELECTROMAGNETICS',AuthorName:'William Hayt',Price:'899',ImageURL:'',SemRaw:'Semester-3' },
  { BookID:'EE203',Category:'BTEC',Branch:'EEE',Year:'2',SubjectName:'Electrical Machines',FullBookName:'ELECTRICAL MACHINERY',AuthorName:'A.E. Fitzgerald',Price:'1099',ImageURL:'',SemRaw:'Semester-4' },
  { BookID:'EE301',Category:'BTEC',Branch:'EEE',Year:'3',SubjectName:'Power Systems',FullBookName:'POWER SYSTEM ENGINEERING',AuthorName:'Nagrath & Kothari',Price:'950',ImageURL:'',SemRaw:'Semester-5' },
  { BookID:'EE302',Category:'BTEC',Branch:'EEE',Year:'3',SubjectName:'Control Systems',FullBookName:'CONTROL SYSTEMS ENGINEERING',AuthorName:'Norman Nise',Price:'1050',ImageURL:'',SemRaw:'Semester-6' },
  { BookID:'EE401',Category:'BTEC',Branch:'EEE',Year:'4',SubjectName:'Renewable Energy Systems',FullBookName:'RENEWABLE ENERGY SYSTEMS',AuthorName:'Vedam Subrahmanyam',Price:'699',ImageURL:'',SemRaw:'Semester-7' },
  // ── ECE (Years 2, 3, 4) ───────────────────────────────────────────────────
  { BookID:'EC201',Category:'BTEC',Branch:'ECE',Year:'2',SubjectName:'Electronic Devices & Circuits',FullBookName:'ELECTRONIC DEVICES AND CIRCUITS',AuthorName:'Sedra & Smith',Price:'1250',ImageURL:'https://m.media-amazon.com/images/I/71HZ+B3tBOL._SY445_.jpg',SemRaw:'Semester-3' },
  { BookID:'EC202',Category:'BTEC',Branch:'ECE',Year:'2',SubjectName:'Signals & Systems',FullBookName:'SIGNALS AND SYSTEMS',AuthorName:'Oppenheim & Willsky',Price:'999',ImageURL:'',SemRaw:'Semester-4' },
  { BookID:'EC301',Category:'BTEC',Branch:'ECE',Year:'3',SubjectName:'Analog Communications',FullBookName:'COMMUNICATION SYSTEMS',AuthorName:'Simon Haykin',Price:'850',ImageURL:'',SemRaw:'Semester-5' },
  { BookID:'EC302',Category:'BTEC',Branch:'ECE',Year:'3',SubjectName:'VLSI Design',FullBookName:'CMOS VLSI DESIGN',AuthorName:'Weste & Harris',Price:'1100',ImageURL:'',SemRaw:'Semester-6' },
  { BookID:'EC401',Category:'BTEC',Branch:'ECE',Year:'4',SubjectName:'Digital Signal Processing',FullBookName:'DISCRETE-TIME SIGNAL PROCESSING',AuthorName:'Oppenheim & Schafer',Price:'1299',ImageURL:'',SemRaw:'Semester-7' },
  // ── Metallurgy (Years 2, 3, 4) ────────────────────────────────────────────
  { BookID:'MT201',Category:'BTEC',Branch:'Metallurgy',Year:'2',SubjectName:'Physical Metallurgy',FullBookName:'PHYSICAL METALLURGY',AuthorName:'Vijendra Singh',Price:'650',ImageURL:'',SemRaw:'Semester-3' },
  { BookID:'MT202',Category:'BTEC',Branch:'Metallurgy',Year:'2',SubjectName:'Materials Science',FullBookName:'MATERIALS SCIENCE AND ENGINEERING',AuthorName:'William Callister',Price:'1099',ImageURL:'',SemRaw:'Semester-4' },
  { BookID:'MT301',Category:'BTEC',Branch:'Metallurgy',Year:'3',SubjectName:'Metal Casting',FullBookName:'METAL CASTING PRINCIPLES',AuthorName:'John Campbell',Price:'780',ImageURL:'',SemRaw:'Semester-5' },
  { BookID:'MT401',Category:'BTEC',Branch:'Metallurgy',Year:'4',SubjectName:'Corrosion Engineering',FullBookName:'CORROSION ENGINEERING',AuthorName:'Fontana',Price:'899',ImageURL:'',SemRaw:'Semester-7' },
  // ── Aeronautical (Years 2, 3, 4) ─────────────────────────────────────────
  { BookID:'AE201',Category:'BTEC',Branch:'Aeronautical',Year:'2',SubjectName:'Aerodynamics',FullBookName:'FUNDAMENTALS OF AERODYNAMICS',AuthorName:'John D. Anderson',Price:'1350',ImageURL:'https://m.media-amazon.com/images/I/71A7WRFqtLL._SY445_.jpg',SemRaw:'Semester-3' },
  { BookID:'AE202',Category:'BTEC',Branch:'Aeronautical',Year:'2',SubjectName:'Aircraft Structures',FullBookName:'MECHANICS OF FLIGHT',AuthorName:'Warren F. Phillips',Price:'1199',ImageURL:'',SemRaw:'Semester-4' },
  { BookID:'AE301',Category:'BTEC',Branch:'Aeronautical',Year:'3',SubjectName:'Propulsion Systems',FullBookName:'AIRCRAFT PROPULSION AND GAS TURBINE ENGINES',AuthorName:'Mattingly',Price:'1450',ImageURL:'',SemRaw:'Semester-5' },
  { BookID:'AE401',Category:'BTEC',Branch:'Aeronautical',Year:'4',SubjectName:'Avionics',FullBookName:'AVIONICS: DEVELOPMENT AND IMPLEMENTATION',AuthorName:'Cary Spitzer',Price:'999',ImageURL:'',SemRaw:'Semester-7' },
];

export function BooksProvider({ children }) {
  const [allBooks, setAllBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Papa.parse(SHEET_CSV_URL, {
      download: true, header: true, skipEmptyLines: true,
      complete: (results) => {
        if (!cancelled) {
          const cleaned = (results.data || [])
            .map(row => {
              const obj = {};
              Object.keys(row).forEach(k => { obj[k.trim()] = (row[k] || '').toString().trim(); });
              return obj;
            })
            .filter(r => r.BookID);
          setAllBooks(cleaned.length > 1 ? cleaned : MOCK_BOOKS);
          setLoading(false);
        }
      },
      error: () => {
        if (!cancelled) { setAllBooks(MOCK_BOOKS); setLoading(false); }
      },
    });
    return () => { cancelled = true; };
  }, []);

  function getBranches(category) {
    return [...new Set(
      allBooks.filter(b => b.Category?.toLowerCase() === category?.toLowerCase()).map(b => b.Branch).filter(Boolean)
    )].sort();
  }

  function getBooks({ branch, year, search = '', semesters = [], sortBy = 'default' }) {
    let books = [...allBooks];
    if (branch) books = books.filter(b => b.Branch?.toLowerCase() === branch.toLowerCase());
    if (year)   books = books.filter(b => String(b.Year) === String(year));
    if (semesters.length > 0) books = books.filter(b => semesters.includes(b.SemRaw?.trim()));
    if (search) {
      const q = search.toLowerCase();
      books = books.filter(b =>
        b.FullBookName?.toLowerCase().includes(q) ||
        b.SubjectName?.toLowerCase().includes(q) ||
        b.AuthorName?.toLowerCase().includes(q)
      );
    }
    if (sortBy === 'price_asc')  books.sort((a, b) => Number(a.Price) - Number(b.Price));
    if (sortBy === 'price_desc') books.sort((a, b) => Number(b.Price) - Number(a.Price));
    if (sortBy === 'name_asc')   books.sort((a, b) => a.FullBookName?.localeCompare(b.FullBookName));
    return books;
  }

  function getSemesters(branch, year) {
    return [...new Set(
      allBooks
        .filter(b => (!branch || b.Branch?.toLowerCase() === branch.toLowerCase()) && (!year || String(b.Year) === String(year)))
        .map(b => b.SemRaw?.trim()).filter(Boolean)
    )].sort();
  }

  return (
    <BooksContext.Provider value={{ allBooks, loading, error, getBranches, getBooks, getSemesters }}>
      {children}
    </BooksContext.Provider>
  );
}

export function useBooks() {
  const ctx = useContext(BooksContext);
  if (!ctx) throw new Error('useBooks must be inside BooksProvider');
  return ctx;
}
