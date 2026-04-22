-- Seed Data for Identity Governance System

-- Insert Users
INSERT INTO users (username, email, password_hash, department, role, status) VALUES
('alice', 'alice@company.com', 'password123', 'Engineering', 'user', 'active'),
('bob', 'bob@company.com', 'password123', 'Sales', 'user', 'active'),
('charlie', 'charlie@company.com', 'password123', 'Marketing', 'user', 'active'),
('admin', 'admin@company.com', 'admin123', 'IT', 'admin', 'active');

-- Insert Applications
INSERT INTO applications (name, description, status) VALUES
('SAP ERP', 'Enterprise Resource Planning system', 'active'),
('Salesforce CRM', 'Customer Relationship Management platform', 'active'),
('AWS Console', 'Amazon Web Services cloud management console', 'active'),
('GitHub Enterprise', 'Code repository and collaboration platform', 'active'),
('ServiceNow', 'IT Service Management platform', 'active'),
('Internal Portal', 'Internal company portal and dashboard', 'active');

-- Insert Roles per Application
-- SAP ERP (app_id = 1)
INSERT INTO roles (name, app_id, description) VALUES
('SAP Viewer', 1, 'Read-only access to SAP reports'),
('SAP Editor', 1, 'Create and edit SAP transactions'),
('SAP Admin', 1, 'Full administrative access to SAP');

-- Salesforce CRM (app_id = 2)
INSERT INTO roles (name, app_id, description) VALUES
('Salesforce Viewer', 2, 'View leads and contacts'),
('Salesforce Editor', 2, 'Edit leads, contacts, and opportunities'),
('Salesforce Admin', 2, 'Full Salesforce administrative access');

-- AWS Console (app_id = 3)
INSERT INTO roles (name, app_id, description) VALUES
('AWS Viewer', 3, 'Read-only access to AWS resources'),
('AWS Editor', 3, 'Create and manage AWS resources'),
('AWS Admin', 3, 'Full AWS administrative access');

-- GitHub Enterprise (app_id = 4)
INSERT INTO roles (name, app_id, description) VALUES
('GitHub Viewer', 4, 'Read-only access to repositories'),
('GitHub Editor', 4, 'Push and pull access to repositories'),
('GitHub Admin', 4, 'Full repository administrative access');

-- ServiceNow (app_id = 5)
INSERT INTO roles (name, app_id, description) VALUES
('ServiceNow Viewer', 5, 'View incidents and requests'),
('ServiceNow Editor', 5, 'Update incidents and requests'),
('ServiceNow Admin', 5, 'Full ServiceNow administrative access');

-- Internal Portal (app_id = 6)
INSERT INTO roles (name, app_id, description) VALUES
('Portal Viewer', 6, 'View internal announcements'),
('Portal Editor', 6, 'Post announcements and content'),
('Portal Admin', 6, 'Full portal administrative access');

-- Insert Sample User Roles (active accesses)
-- Alice has some existing accesses
INSERT INTO user_roles (user_id, role_id, assigned_at, expires_at) VALUES
(1, 1, '2025-01-15 10:00:00', '2026-06-30 23:59:59'),    -- Alice: SAP Viewer
(1, 7, '2025-02-01 10:00:00', '2026-06-30 23:59:59'),    -- Alice: AWS Viewer
(1, 13, '2025-03-01 10:00:00', '2026-06-30 23:59:59'),   -- Alice: GitHub Viewer
(2, 8, '2025-01-20 10:00:00', '2026-06-30 23:59:59'),    -- Bob: AWS Editor
(3, 2, '2025-02-10 10:00:00', '2026-06-30 23:59:59');    -- Charlie: SAP Editor

-- Insert Sample Access Requests
-- Pending requests
INSERT INTO access_requests (user_id, role_id, justification, priority, status, request_type, request_date) VALUES
(1, 3, 'Need admin access to SAP to manage user accounts and configurations', 'high', 'pending', 'new', '2026-03-01 09:00:00'),  -- Alice requesting SAP Admin
(2, 14, 'Need Editor access to post team announcements', 'medium', 'pending', 'new', '2026-03-02 10:30:00'),  -- Bob requesting Portal Editor
(3, 9, 'Need AWS Editor access to deploy marketing campaign infrastructure', 'medium', 'pending', 'new', '2026-03-02 14:00:00');  -- Charlie requesting AWS Editor

-- Approved requests (history)
INSERT INTO access_requests (user_id, role_id, justification, priority, status, request_type, request_date, approval_date, approved_by, expires_at) VALUES
(1, 2, 'Need to create Purchase Orders in SAP for the engineering team', 'medium', 'approved', 'new', '2026-01-15 08:00:00', '2026-01-16 10:00:00', 4, '2026-07-15 23:59:59'),  -- Alice: SAP Editor (approved)
(2, 6, 'Need Salesforce Editor access to manage sales pipeline', 'medium', 'approved', 'new', '2026-01-20 09:00:00', '2026-01-21 11:00:00', 4, '2026-07-20 23:59:59'),  -- Bob: Salesforce Editor (approved)
(3, 16, 'Need Portal Editor to update marketing materials', 'low', 'approved', 'new', '2026-02-01 08:00:00', '2026-02-02 09:00:00', 4, '2026-08-01 23:59:59');  -- Charlie: Portal Editor (approved)

-- Rejected requests (history)
INSERT INTO access_requests (user_id, role_id, justification, priority, status, request_type, request_date, approval_date, approved_by, denial_reason) VALUES
(1, 15, 'Requesting Admin access to Internal Portal', 'high', 'rejected', 'new', '2026-01-10 08:00:00', '2026-01-12 10:00:00', 4, 'Admin access should only be granted to IT team members'),
(2, 11, 'Need ServiceNow Admin to create custom workflows', 'high', 'rejected', 'new', '2026-01-25 09:00:00', '2026-01-26 14:00:00', 4, 'ServiceNow Admin requires IT department certification');
