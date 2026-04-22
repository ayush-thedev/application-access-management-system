-- Expanded Audit Triggers for User Onboarding and App Management

DELIMITER //

-- Log User Onboarding
DROP TRIGGER IF EXISTS trg_LogUserOnboarding //
CREATE TRIGGER trg_LogUserOnboarding
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (table_name, action_type, record_id, action_details)
    VALUES ('users', 'INSERT', NEW.id, 
            CONCAT('New user onboarded: ', NEW.username, ' (', NEW.email, ') in department: ', NEW.department));
END //

-- Log App Creation
DROP TRIGGER IF EXISTS trg_LogAppCreation //
CREATE TRIGGER trg_LogAppCreation
AFTER INSERT ON applications
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (table_name, action_type, record_id, action_details)
    VALUES ('applications', 'INSERT', NEW.id, 
            CONCAT('New application created: ', NEW.name));
END //

-- Log App Update
DROP TRIGGER IF EXISTS trg_LogAppUpdate //
CREATE TRIGGER trg_LogAppUpdate
AFTER UPDATE ON applications
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (table_name, action_type, record_id, action_details)
    VALUES ('applications', 'UPDATE', NEW.id, 
            CONCAT('Application updated. Name: ', NEW.name, ', Status: ', NEW.status));
END //

-- Log App Deletion
DROP TRIGGER IF EXISTS trg_LogAppDeletion //
CREATE TRIGGER trg_LogAppDeletion
AFTER DELETE ON applications
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (table_name, action_type, record_id, action_details)
    VALUES ('applications', 'DELETE', OLD.id, 
            CONCAT('Application deleted: ', OLD.name));
END //

DELIMITER ;
