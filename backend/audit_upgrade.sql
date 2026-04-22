-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    table_name VARCHAR(50) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    record_id INT NOT NULL,
    action_details TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_record ON audit_logs(table_name, record_id);

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS trg_LogAccessDecision;

-- Create the trigger
DELIMITER //

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
