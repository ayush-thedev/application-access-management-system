# Project Details: Application Access Management System

**Project Title:** Application Access Management System  
**Deliverable:** DML Scenarios and PL/SQL Implementations

---

## 1. DML Queries (English Scenarios)

The following 10 scenarios define the core data operations of the system:

1.  **Add New User**: Register a new employee into the system with their department, email, and initial credentials.
2.  **Add New Application**: Onboard a new enterprise software (e.g., Salesforce, GitHub) into the central access portal.
3.  **Deactivate Application**: Disable an application that is no longer in use to prevent any future access requests.
4.  **Setup Application Roles**: Automatically generate the standard 'Admin', 'Editor', and 'Viewer' roles for a newly added application.
5.  **Submit Access Request**: A user requests a specific role for an application, providing a business justification.
6.  **Fetch Pending Requests**: Administrators retrieve all requests with a 'pending' status to review them.
7.  **Approve Access**: An administrator approves a request, which should trigger the actual role assignment.
8.  **Reject Access**: An administrator denies a request, providing a reason for the rejection.
9.  **Grant Role Assignment**: Formally link a user to a specific role in the `user_roles` table after approval.
10. **User Search**: Looking up a user's current department and status to verify their identity and access level.

---

## 2. PL/SQL Scenario Identification

The following PL/SQL blocks automate the DML scenarios listed above:

### A. Procedures with Cursors
1.  **Macro-Deactivation (`DeactivateDeptAccess`)**:  
    Uses a **Cursor** to iterate through all users of a specific department. For each user found, it performs the **"Deactivate User"** DML and revokes their active assignments.
2.  **Request Priority Audit (`IdentifyStaleRequests`)**:  
    Uses a **Cursor** to find all **"Pending Requests"** that are older than 3 days. It automatically updates their priority to 'High' so they appear at the top of the admin dashboard.

### B. Functions
1.  **Access Counter (`fn_GetActiveRoleCount`)**:  
    Calculates the total number of approved assignments for a user. This powers the **"User Search"** view by showing the "Access Count" for each profile.
2.  **Duplicate Request Checker (`fn_CheckDuplicateRequest`)**:  
    Before a **"Submit Access Request"** DML is executed, this function checks if a pending request already exists for that user and role to prevent duplicates.

### C. Triggers
1.  **Role Auto-Provisioning (`trg_AutoSetupAppRoles`)**:  
    Linked to **"Add New Application"**. Whenever a new application is inserted, this trigger automatically executes the **"Setup Application Roles"** DML to create the default role set.
2.  **Operational Audit Log (`trg_LogAccessDecision`)**:  
    Linked to **"Approve/Reject Access"**. Whenever a request status is updated, this trigger captures the change and logs it into an audit table for compliance.

---

## 3. PL/SQL (MySQL) Implementation

```sql
DELIMITER //

-- [PROCEDURE 1: Cursor-based Department Deactivation]
CREATE PROCEDURE DeactivateDeptAccess(IN p_dept_name VARCHAR(100))
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_user_id INT;
    DECLARE cur CURSOR FOR SELECT id FROM users WHERE department = p_dept_name;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO v_user_id;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- DML: Deactivate User
        UPDATE users SET status = 'inactive' WHERE id = v_user_id;
        
        -- DML: Remove all associated roles
        DELETE FROM user_roles WHERE user_id = v_user_id;
        
    END LOOP;
    CLOSE cur;
END //

-- [PROCEDURE 2: Cursor-based Request Escalation]
CREATE PROCEDURE IdentifyStaleRequests()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_req_id INT;
    -- Cursor for pending requests older than 3 days
    DECLARE cur CURSOR FOR 
        SELECT id FROM access_requests 
        WHERE status = 'pending' AND request_date < (NOW() - INTERVAL 3 DAY);
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN cur;
    escalate_loop: LOOP
        FETCH cur INTO v_req_id;
        IF done THEN
            LEAVE escalate_loop;
        END IF;
        
        -- DML: Update Priority to High
        UPDATE access_requests SET priority = 'high' WHERE id = v_req_id;
    END LOOP;
    CLOSE cur;
END //

-- [FUNCTION 1: Access Count for User Search]
CREATE FUNCTION fn_GetActiveRoleCount(p_user_id INT) 
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE r_count INT;
    SELECT COUNT(*) INTO r_count FROM user_roles WHERE user_id = p_user_id;
    RETURN r_count;
END //

-- [FUNCTION 2: Prevent Duplicate Requests]
CREATE FUNCTION fn_CheckDuplicateRequest(p_user_id INT, p_role_id INT) 
RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    DECLARE v_exists INT;
    SELECT COUNT(*) INTO v_exists FROM access_requests 
    WHERE user_id = p_user_id AND role_id = p_role_id AND status = 'pending';
    RETURN v_exists > 0;
END //

-- [TRIGGER 1: Auto-Setup Roles for New App]
CREATE TRIGGER trg_AutoSetupAppRoles
AFTER INSERT ON applications
FOR EACH ROW
BEGIN
    -- DML: Automatically Create Standard Roles
    INSERT INTO roles (name, app_id, description) VALUES 
    ('Admin', NEW.id, 'Full access'),
    ('Editor', NEW.id, 'Modification access'),
    ('Viewer', NEW.id, 'Read-only access');
END //

-- [TRIGGER 2: Audit Trail for Access Decisions]
CREATE TRIGGER trg_LogAccessDecision
AFTER UPDATE ON access_requests
FOR EACH ROW
BEGIN
    IF OLD.status <> NEW.status THEN
        INSERT INTO audit_logs (table_name, action_type, record_id, action_details)
        VALUES ('access_requests', 'UPDATE', NEW.id, 
                CONCAT('Request status changed from ', OLD.status, ' to ', NEW.status));
    END IF;
END //

DELIMITER ;
```
