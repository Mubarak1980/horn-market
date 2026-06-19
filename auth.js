
/* ========================================
   AUTH PAGE
======================================== */

.auth-page {
    min-height: 100vh;

    display: flex;
    justify-content: center;
    align-items: center;

    padding: 40px 20px;

    background:
        linear-gradient(
            135deg,
            #2563eb,
            #1d4ed8
        );
}

/* ========================================
   AUTH CARD
======================================== */

.auth-card {
    width: 100%;
    max-width: 450px;

    background: white;

    padding: 40px;

    border-radius: 20px;

    box-shadow:
        0 20px 40px rgba(0,0,0,.15);
}

/* ========================================
   LOGO
======================================== */

.auth-logo {
    text-align: center;
    margin-bottom: 25px;
}

.auth-logo h1 {
    color: var(--primary-color);
    font-size: 2rem;
}

/* ========================================
   TITLE
======================================== */

.auth-title {
    text-align: center;
    margin-bottom: 30px;
}

.auth-title h2 {
    margin-bottom: 8px;
}

.auth-title p {
    color: var(--text-light);
}

/* ========================================
   FORM
======================================== */

.auth-form {
    display: flex;
    flex-direction: column;
    gap: 18px;
}

/* ========================================
   FORM GROUP
======================================== */

.form-group {
    display: flex;
    flex-direction: column;
}

.form-group label {
    margin-bottom: 8px;
    font-weight: 600;
}

/* ========================================
   INPUTS
======================================== */

.auth-input {
    padding: 14px;

    border: 1px solid var(--border-color);

    border-radius: var(--radius);

    font-size: 1rem;

    transition: var(--transition);
}

.auth-input:focus {
    border-color: var(--primary-color);
}

/* ========================================
   PASSWORD AREA
======================================== */

.password-wrapper {
    position: relative;
}

.password-toggle {
    position: absolute;

    right: 15px;
    top: 50%;

    transform: translateY(-50%);

    cursor: pointer;

    color: var(--text-light);
}

/* ========================================
   AUTH BUTTON
======================================== */

.auth-btn {
    width: 100%;

    padding: 14px;

    background: var(--primary-color);

    color: white;

    font-size: 1rem;
    font-weight: 600;

    border-radius: var(--radius);

    transition: var(--transition);
}

.auth-btn:hover {
    background: var(--primary-hover);
}

/* ========================================
   FORGOT PASSWORD
======================================== */

.forgot-password {
    text-align: right;
}

.forgot-password a {
    color: var(--primary-color);
    font-size: .95rem;
}

.forgot-password a:hover {
    text-decoration: underline;
}

/* ========================================
   DIVIDER
======================================== */

.auth-divider {
    display: flex;
    align-items: center;

    margin: 20px 0;
}

.auth-divider::before,
.auth-divider::after {
    content: "";

    flex: 1;

    height: 1px;

    background: var(--border-color);
}

.auth-divider span {
    margin: 0 15px;
    color: var(--text-light);
    font-size: .9rem;
}

/* ========================================
   SOCIAL LOGIN
======================================== */

.social-login {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.social-btn {
    width: 100%;

    padding: 12px;

    border: 1px solid var(--border-color);

    border-radius: var(--radius);

    background: white;

    font-weight: 600;

    transition: var(--transition);
}

.social-btn:hover {
    background: #f8fafc;
}

/* ========================================
   FOOTER LINKS
======================================== */

.auth-footer {
    text-align: center;
    margin-top: 25px;
}

.auth-footer p {
    color: var(--text-light);
}

.auth-footer a {
    color: var(--primary-color);
    font-weight: 600;
}

.auth-footer a:hover {
    text-decoration: underline;
}

/* ========================================
   ALERTS
======================================== */

.alert {
    padding: 12px;

    border-radius: var(--radius);

    font-size: .95rem;
}

.alert-success {
    background: #dcfce7;
    color: #166534;
}

.alert-error {
    background: #fee2e2;
    color: #991b1b;
}

/* ========================================
   CHECKBOX
======================================== */

.checkbox-group {
    display: flex;
    align-items: center;
    gap: 10px;
}

.checkbox-group input {
    width: auto;
}

.checkbox-group label {
    margin: 0;
    color: var(--text-light);
}

/* ========================================
   RESPONSIVE
======================================== */

@media (max-width: 500px) {

    .auth-card {
        padding: 25px;
    }

    .auth-logo h1 {
        font-size: 1.7rem;
    }

    .auth-title h2 {
        font-size: 1.5rem;
    }
}
