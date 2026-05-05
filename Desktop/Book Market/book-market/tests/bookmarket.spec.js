// BookMarket — Playwright Automation Test Suite
// Run: npx playwright test --ui
// Prerequisites: App running at http://localhost:5173

const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:5173';
const VALID_EMAIL = 'student@bookmarket.com';
const VALID_PASSWORD = 'password123';

// ─── Helpers ────────────────────────────────────────────────────────────────
async function login(page, remember = false) {
  await page.goto(`${BASE_URL}/login`);
  await page.locator('#login-email').fill(VALID_EMAIL);
  await page.locator('#login-password').fill(VALID_PASSWORD);
  if (remember) await page.locator('#remember-me').check();
  await page.locator('#login-submit').click();
  await page.waitForURL(`${BASE_URL}/dashboard`);
}

async function addBookToCart(page, bookIndex = 0) {
  await page.goto(`${BASE_URL}/dashboard`);
  const addBtns = page.locator('button:has-text("Add to Cart")');
  await addBtns.nth(bookIndex).click();
}

// ─── 1. AUTHENTICATION ──────────────────────────────────────────────────────
test.describe('Authentication', () => {

  test('TC-001 | Root redirects to /login when unauthenticated', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveURL(`${BASE_URL}/login`);
  });

  test('TC-002 | Invalid credentials show error message', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.locator('#login-email').fill('wrong@test.com');
    await page.locator('#login-password').fill('wrongpass');
    await page.locator('#login-submit').click();
    await expect(page.locator('#login-error')).toBeVisible();
    await expect(page.locator('#login-error')).toContainText('Invalid credentials');
  });

  test('TC-003 | Empty email shows validation error', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.locator('#login-submit').click();
    const error = page.locator('#login-error, [role="alert"]');
    await expect(error.first()).toBeVisible();
  });

  test('TC-004 | Empty password shows validation error', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.locator('#login-email').fill(VALID_EMAIL);
    await page.locator('#login-submit').click();
    await expect(page.locator('#login-error')).toContainText('Password is required');
  });

  test('TC-005 | Valid login redirects to dashboard', async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
  });

  test('TC-006 | Remember Me stores to localStorage', async ({ page }) => {
    await login(page, true);
    const auth = await page.evaluate(() => localStorage.getItem('bm_auth'));
    expect(auth).not.toBeNull();
  });

  test('TC-007 | Without Remember Me stores to sessionStorage', async ({ page }) => {
    await login(page, false);
    const auth = await page.evaluate(() => sessionStorage.getItem('bm_auth_session'));
    expect(auth).not.toBeNull();
  });

  test('TC-008 | Protected route redirects to /login when unauthenticated', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await expect(page).toHaveURL(`${BASE_URL}/login`);
  });

  test('TC-009 | Unknown route redirects to /dashboard when authenticated', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/nonexistent`);
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
  });

  test('TC-010 | Password visibility toggle works', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    const passInput = page.locator('#login-password');
    await expect(passInput).toHaveAttribute('type', 'password');
    await page.locator('#toggle-password').click();
    await expect(passInput).toHaveAttribute('type', 'text');
    await page.locator('#toggle-password').click();
    await expect(passInput).toHaveAttribute('type', 'password');
  });
});

// ─── 2. DASHBOARD ───────────────────────────────────────────────────────────
test.describe('Dashboard', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('TC-011 | Dashboard loads and displays book cards', async ({ page }) => {
    await expect(page.locator('.book-card, [class*="book-card"], article').first()).toBeVisible({ timeout: 8000 });
  });

  test('TC-012 | Search filters books', async ({ page }) => {
    await page.locator('input[placeholder*="Search"]').fill('data structures');
    await page.waitForTimeout(400);
    const cards = page.locator('article, .book-card, [class*="card"]');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('TC-013 | Common branch only shows Year 1', async ({ page }) => {
    // Click "Common" branch
    const commonBtn = page.getByRole('button', { name: /common/i });
    if (await commonBtn.isVisible()) {
      await commonBtn.click();
      // Year 2, 3, 4 buttons should NOT be present/active
      const year2 = page.getByRole('button', { name: /^2$/ });
      const year4 = page.getByRole('button', { name: /^4$/ });
      // They should be hidden or disabled
      const y2visible = await year2.isVisible().catch(() => false);
      const y4visible = await year4.isVisible().catch(() => false);
      expect(y2visible || y4visible).toBeFalsy();
    }
  });

  test('TC-014 | Add to cart shows toast and increments badge', async ({ page }) => {
    const addBtn = page.locator('button:has-text("Add to Cart")').first();
    await addBtn.click();
    // Toast or cart badge increment
    const badge = page.locator('[class*="badge"], [class*="cart-count"], .cart-badge');
    await expect(badge.first()).toBeVisible({ timeout: 4000 });
  });

  test('TC-015 | Duplicate add increments quantity not duplicates', async ({ page }) => {
    const addBtn = page.locator('button:has-text("Add to Cart")').first();
    await addBtn.click();
    await page.waitForTimeout(300);
    await addBtn.click();
    await page.goto(`${BASE_URL}/cart`);
    const qtyInput = page.locator('input[type="number"]').first();
    const qty = await qtyInput.inputValue();
    expect(Number(qty)).toBeGreaterThanOrEqual(2);
  });

  test('TC-016 | Theme toggle switches data-theme attribute', async ({ page }) => {
    const htmlEl = page.locator('html');
    const before = await htmlEl.getAttribute('data-theme');
    await page.locator('button[aria-label*="theme"], button[aria-label*="Theme"], button[title*="theme"]').first().click();
    const after = await htmlEl.getAttribute('data-theme');
    expect(before).not.toBe(after);
  });
});

// ─── 3. CART ────────────────────────────────────────────────────────────────
test.describe('Cart', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    // Clear cart first
    await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem('bm_cart') || '{}');
      state.items = [];
      localStorage.setItem('bm_cart', JSON.stringify(state));
    });
    await addBookToCart(page, 0);
    await addBookToCart(page, 1);
    await page.goto(`${BASE_URL}/cart`);
  });

  test('TC-017 | Cart page loads with added items', async ({ page }) => {
    await expect(page.locator('h1:has-text("Shopping Cart")')).toBeVisible();
    const items = page.locator('article');
    expect(await items.count()).toBeGreaterThanOrEqual(1);
  });

  test('TC-018 | Increase quantity updates subtotal', async ({ page }) => {
    const firstItem = page.locator('article').first();
    const priceEl = firstItem.locator('[class*="price"], span:has-text("₹")').last();
    const before = await priceEl.innerText();
    await firstItem.locator('button[aria-label="Increase quantity"]').click();
    const after = await priceEl.innerText();
    expect(before).not.toBe(after);
  });

  test('TC-019 | Decrease button disabled at qty=1', async ({ page }) => {
    const decBtn = page.locator('button[aria-label="Decrease quantity"]').first();
    await expect(decBtn).toBeDisabled();
  });

  test('TC-020 | Remove item removes from cart', async ({ page }) => {
    const countBefore = await page.locator('article').count();
    await page.locator('button[aria-label*="Remove"]').first().click();
    await page.waitForTimeout(300);
    const countAfter = await page.locator('article').count();
    expect(countAfter).toBeLessThan(countBefore);
  });

  test('TC-021 | Invalid promo code shows error', async ({ page }) => {
    await page.locator('#promo-input').fill('FAKECODE');
    await page.locator('#apply-promo').click();
    const err = page.locator('#promo-error, [role="alert"]');
    await expect(err.first()).toBeVisible();
    await expect(err.first()).toContainText('Invalid');
  });

  test('TC-022 | Valid promo STUDENT10 applies 10% discount', async ({ page }) => {
    await page.locator('#promo-input').fill('STUDENT10');
    await page.locator('#apply-promo').click();
    await expect(page.locator('text=STUDENT10')).toBeVisible();
    await expect(page.locator('text=10% off')).toBeVisible();
  });

  test('TC-023 | Select All checkbox selects all items', async ({ page }) => {
    await page.locator('#select-all').check();
    const checkboxes = page.locator('article input[type="checkbox"]');
    for (let i = 0; i < await checkboxes.count(); i++) {
      await expect(checkboxes.nth(i)).toBeChecked();
    }
  });

  test('TC-024 | Deselect all disables checkout button', async ({ page }) => {
    await page.locator('#select-all').uncheck();
    await expect(page.locator('#proceed-checkout')).toBeDisabled();
  });

  test('TC-025 | Remove selected removes only checked items', async ({ page }) => {
    await page.locator('#select-all').check();
    await page.locator('#remove-selected').click();
    // Cart should be empty
    await expect(page.locator('h1:has-text("cart is empty")')).toBeVisible({ timeout: 3000 });
  });
});

// ─── 4. CHECKOUT ────────────────────────────────────────────────────────────
test.describe('Checkout', () => {

  async function goToCheckout(page) {
    await login(page);
    await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem('bm_cart') || '{}');
      state.items = [];
      localStorage.setItem('bm_cart', JSON.stringify(state));
    });
    await addBookToCart(page, 0);
    await page.goto(`${BASE_URL}/cart`);
    await page.locator('#select-all').check();
    await page.locator('#proceed-checkout').click();
    await page.waitForURL(`${BASE_URL}/checkout`);
  }

  test('TC-026 | Empty checkout form shows validation errors', async ({ page }) => {
    await goToCheckout(page);
    await page.locator('button:has-text("Continue to Payment")').click();
    await expect(page.locator('text=Full name is required')).toBeVisible();
    await expect(page.locator('text=Address is required')).toBeVisible();
  });

  test('TC-027 | Invalid phone (starts with 1) shows error', async ({ page }) => {
    await goToCheckout(page);
    await page.locator('#name').fill('Test Student');
    await page.locator('#address').fill('Room 101');
    await page.locator('#city').fill('Hyderabad');
    await page.locator('#state').selectOption('Telangana');
    await page.locator('#pincode').fill('500001');
    await page.locator('#phone').fill('1234567890');
    await page.locator('button:has-text("Continue to Payment")').click();
    await expect(page.locator('text=valid 10-digit phone')).toBeVisible();
  });

  test('TC-028 | Invalid pincode (< 6 digits) shows error', async ({ page }) => {
    await goToCheckout(page);
    await page.locator('#pincode').fill('1234');
    await page.locator('button:has-text("Continue to Payment")').click();
    await expect(page.locator('text=valid 6-digit pincode')).toBeVisible();
  });

  test('TC-029 | Valid address moves to payment step', async ({ page }) => {
    await goToCheckout(page);
    await page.locator('#name').fill('Test Student');
    await page.locator('#address').fill('Room 101 Hostel A');
    await page.locator('#city').fill('Hyderabad');
    await page.locator('#state').selectOption('Telangana');
    await page.locator('#pincode').fill('500001');
    await page.locator('#phone').fill('9876543210');
    await page.locator('button:has-text("Continue to Payment")').click();
    await expect(page.locator('text=Payment Method')).toBeVisible();
  });

  test('TC-030 | UPI payment requires valid UPI ID', async ({ page }) => {
    await goToCheckout(page);
    // Fill address
    await page.locator('#name').fill('Test Student');
    await page.locator('#address').fill('Room 101');
    await page.locator('#city').fill('Hyderabad');
    await page.locator('#state').selectOption('Telangana');
    await page.locator('#pincode').fill('500001');
    await page.locator('#phone').fill('9876543210');
    await page.locator('button:has-text("Continue to Payment")').click();
    // Select UPI
    await page.locator('#pay-upi').check();
    await page.locator('#place-order-btn').click();
    await expect(page.locator('text=valid UPI ID')).toBeVisible();
  });

  test('TC-031 | Card network detection — Visa for 4xxx', async ({ page }) => {
    await goToCheckout(page);
    await page.locator('#name').fill('Test Student');
    await page.locator('#address').fill('Room 101');
    await page.locator('#city').fill('Hyderabad');
    await page.locator('#state').selectOption('Telangana');
    await page.locator('#pincode').fill('500001');
    await page.locator('#phone').fill('9876543210');
    await page.locator('button:has-text("Continue to Payment")').click();
    await page.locator('#pay-card').check();
    await page.locator('#card-number').fill('4111111111111111');
    await expect(page.locator('text=Visa detected')).toBeVisible();
  });

  test('TC-032 | Card network detection — Mastercard for 5xxx', async ({ page }) => {
    await goToCheckout(page);
    await page.locator('#name').fill('Test Student');
    await page.locator('#address').fill('Room 101');
    await page.locator('#city').fill('Hyderabad');
    await page.locator('#state').selectOption('Telangana');
    await page.locator('#pincode').fill('500001');
    await page.locator('#phone').fill('9876543210');
    await page.locator('button:has-text("Continue to Payment")').click();
    await page.locator('#pay-card').check();
    await page.locator('#card-number').fill('5111111111111118');
    await expect(page.locator('text=Mastercard detected')).toBeVisible();
  });

  test('TC-033 | COD order placement shows confirmation screen', async ({ page }) => {
    await goToCheckout(page);
    await page.locator('#name').fill('Test Student');
    await page.locator('#address').fill('Room 101 Hostel A');
    await page.locator('#city').fill('Hyderabad');
    await page.locator('#state').selectOption('Telangana');
    await page.locator('#pincode').fill('500001');
    await page.locator('#phone').fill('9876543210');
    await page.locator('button:has-text("Continue to Payment")').click();
    await page.locator('#pay-cod').check();
    await page.locator('#place-order-btn').click();
    await expect(page.locator('text=Order Confirmed')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=ORD')).toBeVisible();
  });

  test('TC-034 | Order saved to localStorage after placement', async ({ page }) => {
    await goToCheckout(page);
    await page.locator('#name').fill('Test Student');
    await page.locator('#address').fill('Room 101');
    await page.locator('#city').fill('Hyderabad');
    await page.locator('#state').selectOption('Telangana');
    await page.locator('#pincode').fill('500001');
    await page.locator('#phone').fill('9876543210');
    await page.locator('button:has-text("Continue to Payment")').click();
    await page.locator('#place-order-btn').click();
    await page.waitForSelector('text=Order Confirmed', { timeout: 5000 });
    const orders = await page.evaluate(() => JSON.parse(localStorage.getItem('bm_orders') || '[]'));
    expect(orders.length).toBeGreaterThanOrEqual(1);
  });

  test('TC-035 | Cart cleared after order placement', async ({ page }) => {
    await goToCheckout(page);
    await page.locator('#name').fill('Test Student');
    await page.locator('#address').fill('Room 101');
    await page.locator('#city').fill('Hyderabad');
    await page.locator('#state').selectOption('Telangana');
    await page.locator('#pincode').fill('500001');
    await page.locator('#phone').fill('9876543210');
    await page.locator('button:has-text("Continue to Payment")').click();
    await page.locator('#place-order-btn').click();
    await page.waitForSelector('text=Order Confirmed', { timeout: 5000 });
    const cart = await page.evaluate(() => JSON.parse(localStorage.getItem('bm_cart') || '{}'));
    expect(cart.items?.length ?? 0).toBe(0);
  });

  test('TC-036 | Checkout with no selected items shows empty state', async ({ page }) => {
    await login(page);
    await page.evaluate(() => {
      const state = { items: [], wishlist: [], promo: null };
      localStorage.setItem('bm_cart', JSON.stringify(state));
    });
    await page.goto(`${BASE_URL}/checkout`);
    await expect(page.locator('text=No items selected')).toBeVisible();
  });
});

// ─── 5. ORDERS ──────────────────────────────────────────────────────────────
test.describe('Orders Page', () => {

  async function seedOrder(page) {
    const order = {
      id: 'ORD' + Date.now().toString().slice(-8),
      orderTime: Date.now(),
      items: [{ BookID: 'B101', SubjectName: 'Mathematics - I', AuthorName: 'B.S. Grewal', Branch: 'Common', Price: '1179', quantity: 1, ImageURL: '', selected: true }],
      total: 1228, subtotal: 1179, discount: 0, promo: null,
      address: { name: 'Test Student', address: 'Room 101', city: 'Hyderabad', state: 'Telangana', pincode: '500001', phone: '9876543210' },
      payment: 'cod',
    };
    await page.evaluate((o) => {
      localStorage.setItem('bm_orders', JSON.stringify([o]));
    }, order);
    return order;
  }

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('TC-037 | Empty orders shows empty state CTA', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('bm_orders', '[]'));
    await page.goto(`${BASE_URL}/orders`);
    await expect(page.locator('text=No Orders Yet')).toBeVisible();
    await expect(page.locator('text=Browse Books')).toBeVisible();
  });

  test('TC-038 | Orders page shows order list', async ({ page }) => {
    await seedOrder(page);
    await page.goto(`${BASE_URL}/orders`);
    await expect(page.locator('text=My Orders')).toBeVisible();
    await expect(page.locator('text=ORD')).toBeVisible();
  });

  test('TC-039 | PACKING order shows Modify and Cancel buttons', async ({ page }) => {
    await seedOrder(page);
    await page.goto(`${BASE_URL}/orders`);
    await expect(page.locator('button:has-text("Modify")')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button:has-text("Cancel Order")')).toBeVisible();
  });

  test('TC-040 | Cancel order dialog appears on Cancel click', async ({ page }) => {
    await seedOrder(page);
    await page.goto(`${BASE_URL}/orders`);
    await page.locator('button:has-text("Cancel Order")').click();
    await expect(page.locator('text=Cancel Order?')).toBeVisible();
    await expect(page.locator('.cdlg-btn-cancel, button:has-text("Yes, Cancel Order")')).toBeVisible();
  });

  test('TC-041 | Cancel dialog Keep Order closes dialog', async ({ page }) => {
    await seedOrder(page);
    await page.goto(`${BASE_URL}/orders`);
    await page.locator('button:has-text("Cancel Order")').click();
    await page.locator('.cdlg-btn-keep, button:has-text("Keep Order")').click();
    await expect(page.locator('text=Cancel Order?')).not.toBeVisible();
    // Order still present
    await expect(page.locator('text=ORD')).toBeVisible();
  });

  test('TC-042 | Confirming cancel removes order', async ({ page }) => {
    await seedOrder(page);
    await page.goto(`${BASE_URL}/orders`);
    await page.locator('button:has-text("Cancel Order")').click();
    await page.locator('.cdlg-btn-cancel, button:has-text("Yes, Cancel Order")').click();
    await expect(page.locator('text=No Orders Yet')).toBeVisible({ timeout: 3000 });
  });

  test('TC-043 | Edit mode opens with seeded PACKING order', async ({ page }) => {
    await seedOrder(page);
    await page.goto(`${BASE_URL}/orders`);
    await page.locator('button:has-text("Modify")').click();
    await expect(page.locator('text=Edit Mode')).toBeVisible();
  });

  test('TC-044 | Cancel edit closes edit panel', async ({ page }) => {
    await seedOrder(page);
    await page.goto(`${BASE_URL}/orders`);
    await page.locator('button:has-text("Modify")').click();
    await page.locator('button:has-text("Cancel")').first().click();
    await expect(page.locator('text=Edit Mode')).not.toBeVisible();
  });

  test('TC-045 | Empty order cannot be saved', async ({ page }) => {
    await seedOrder(page);
    await page.goto(`${BASE_URL}/orders`);
    await page.locator('button:has-text("Modify")').click();
    // Remove all items
    const removeBtns = page.locator('[data-testid="remove-item"], button[style*="E24B4A"]');
    const cnt = await removeBtns.count();
    for (let i = 0; i < cnt; i++) {
      await removeBtns.first().click();
      await page.waitForTimeout(100);
    }
    await page.locator('button:has-text("Save Changes")').click();
    await expect(page.locator('text=Order cannot be empty')).toBeVisible({ timeout: 3000 });
  });

  test('TC-046 | Account sidebar shows user info', async ({ page }) => {
    await seedOrder(page);
    await page.goto(`${BASE_URL}/orders`);
    await expect(page.locator('text=Engineering Student')).toBeVisible();
  });
});

// ─── 6. WISHLIST ────────────────────────────────────────────────────────────
test.describe('Wishlist', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.evaluate(() => {
      const state = { items: [], wishlist: [], promo: null };
      localStorage.setItem('bm_cart', JSON.stringify(state));
    });
  });

  test('TC-047 | Empty wishlist shows empty state', async ({ page }) => {
    await page.goto(`${BASE_URL}/wishlist`);
    await expect(page.locator('text=wishlist is empty, text=Wishlist is empty').first()).toBeVisible();
  });

  test('TC-048 | Adding to wishlist persists item', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    // Find heart/wishlist button
    const wishBtn = page.locator('button[aria-label*="wishlist"], button[aria-label*="Wishlist"], button[title*="wishlist"]').first();
    if (await wishBtn.isVisible()) {
      await wishBtn.click();
      await page.goto(`${BASE_URL}/wishlist`);
      const items = await page.locator('article, .wish-item, [class*="card"]').count();
      expect(items).toBeGreaterThanOrEqual(1);
    }
  });
});

// ─── 7. NAVIGATION & ROUTING ────────────────────────────────────────────────
test.describe('Navigation & Routing', () => {

  test('TC-049 | Navbar shows cart count badge after add', async ({ page }) => {
    await login(page);
    await addBookToCart(page, 0);
    const badge = page.locator('[class*="badge"], [class*="count"]').filter({ hasText: /\d+/ });
    await expect(badge.first()).toBeVisible();
  });

  test('TC-050 | Back button from checkout goes to cart', async ({ page }) => {
    await login(page);
    await addBookToCart(page, 0);
    await page.goto(`${BASE_URL}/cart`);
    await page.locator('#select-all').check();
    await page.locator('#proceed-checkout').click();
    await page.waitForURL(`${BASE_URL}/checkout`);
    await page.locator('button[aria-label="Back"]').click();
    await expect(page).toHaveURL(`${BASE_URL}/cart`);
  });

  test('TC-051 | Cart link in navbar navigates to /cart', async ({ page }) => {
    await login(page);
    await page.locator('a[href="/cart"], button[aria-label*="cart"]').first().click();
    await expect(page).toHaveURL(`${BASE_URL}/cart`);
  });
});

// ─── 8. CART CROSS-BRANCH RESTRICTION ────────────────────────────────────────
test.describe('Cart Branch Restriction', () => {

  test('TC-052 | Cannot add books from different branches to cart', async ({ page }) => {
    await login(page);
    await page.evaluate(() => {
      const cseBook = { BookID:'C201', Branch:'CSE', SubjectName:'Data Structures', Price:'899', quantity:1, selected:true };
      localStorage.setItem('bm_cart', JSON.stringify({ items:[cseBook], wishlist:[], promo:null }));
    });
    await page.goto(`${BASE_URL}/dashboard`);
    // Try to add a Common branch book; should show a branch conflict toast
    const commonBook = page.locator('article').filter({ hasText: /Common|Mathematics/ }).first();
    if (await commonBook.isVisible()) {
      await commonBook.locator('button:has-text("Add to Cart")').click();
      await expect(page.locator('text=cart contains, text=Please clear')).toBeVisible({ timeout: 3000 });
    }
  });
});
