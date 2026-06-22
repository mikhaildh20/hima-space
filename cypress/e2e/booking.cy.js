describe('Core Workflows E2E Test', () => {
  const uniqueId = Date.now();
  const bookingTitle = `E2E Rapat Himpunan ${uniqueId}`;

  // Helper to format tomorrow's date as YYYY-MM-DD
  const getTomorrowDateString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const tomorrowStr = getTomorrowDateString();

  it('1. Student logs in, creates a pending booking, and views it in history', () => {
    // Visit Login
    cy.visit('/login');
    cy.get('input[type="email"]').type('budi@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    // Verify redirected to Calendar
    cy.url().should('include', '/kalender');
    
    // Visit New Booking form
    cy.visit('/booking/new');
    
    // Fill the booking form
    cy.get('input[placeholder="Contoh: Rapat Pengurus Harian HIMA"]').type(bookingTitle);
    
    // Select room "Ruang HIMA" using its option text helper
    cy.get('select option').contains('Ruang HIMA').then(option => {
      cy.get('select').select(option.val());
    });

    cy.get('input[type="date"]').type(tomorrowStr);
    
    // Fill Time (using HH:MM values)
    cy.get('input[type="time"]').first().type('09:00');
    cy.get('input[type="time"]').last().type('11:00');
    
    cy.get('textarea').type('E2E testing description text.');
    
    // Submit
    cy.get('button[type="submit"]').click();

    // Verify redirected back to Calendar
    cy.url().should('include', '/kalender');

    // Go to History
    cy.visit('/histori');
    cy.contains(bookingTitle).should('exist');
    cy.contains('Pending').should('exist');
  });

  it('2. Admin logs in, approves the booking in approval console, and stats update', () => {
    // Clear student token and login as Admin
    cy.clearLocalStorage();
    cy.visit('/login');
    cy.get('input[type="email"]').type('admin@hima.id');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();

    // Redirect to Admin Dashboard on login
    cy.url().should('include', '/admin/dashboard');

    // Visit Dashboard Admin to check stats
    cy.contains('Dashboard Admin').should('exist');

    // Go to Approvals
    cy.visit('/admin/approval');
    cy.contains('Persetujuan Booking').should('exist');
    cy.contains(bookingTitle).should('exist');

    // Approve the booking
    cy.contains('h2', bookingTitle).closest('.p-6').within(() => {
      cy.contains('button', 'Approve').click();
    });

    // Wait and check if the booking disappears from approvals queue
    cy.contains(bookingTitle).should('not.exist');
  });

  it('3. Student logs in, checks status is approved, and cancels the booking', () => {
    // Clear admin token and login back as Student
    cy.clearLocalStorage();
    cy.visit('/login');
    cy.get('input[type="email"]').type('budi@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    // Visit History
    cy.visit('/histori');
    cy.contains(bookingTitle).should('exist');
    cy.contains('Disetujui').should('exist');

    // Click Batalkan
    cy.contains('h2', bookingTitle).closest('.p-6').within(() => {
      cy.contains('button', 'Batalkan').click();
    });

    // Confirm cancel in Modal
    cy.contains('h3', 'Batalkan Booking?').should('be.visible');
    cy.contains('button', 'Ya, Batalkan').click();

    // Verify it is now cancelled
    cy.contains(bookingTitle).should('exist');
    cy.contains('Dibatalkan').should('exist');
  });
});
