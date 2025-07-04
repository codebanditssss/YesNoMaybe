
CREATE OR REPLACE FUNCTION notify_realtime_changes()
RETURNS trigger AS $$
DECLARE
  payload json;
  channel_name text;
BEGIN
  -- Determine channel based on table
  channel_name := TG_TABLE_NAME || '_changes';
  
  -- Build payload based on operation
  IF TG_OP = 'DELETE' THEN
    payload := json_build_object(
      'operation', TG_OP,
      'table', TG_TABLE_NAME,
      'old', row_to_json(OLD),
      'timestamp', extract(epoch from now()) * 1000
    );
  ELSE
    payload := json_build_object(
      'operation', TG_OP,
      'table', TG_TABLE_NAME,
      'new', row_to_json(NEW),
      'old', CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END,
      'timestamp', extract(epoch from now()) * 1000
    );
  END IF;
  
  -- Send notification
  PERFORM pg_notify(channel_name, payload::text);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to critical tables
CREATE TRIGGER orders_realtime_trigger
  AFTER INSERT OR UPDATE OR DELETE ON orders
  FOR EACH ROW EXECUTE FUNCTION notify_realtime_changes();

CREATE TRIGGER trades_realtime_trigger  
  AFTER INSERT OR UPDATE OR DELETE ON trades
  FOR EACH ROW EXECUTE FUNCTION notify_realtime_changes();

CREATE TRIGGER user_balances_realtime_trigger
  AFTER INSERT OR UPDATE OR DELETE ON user_balances  
  FOR EACH ROW EXECUTE FUNCTION notify_realtime_changes();

CREATE TRIGGER markets_realtime_trigger
  AFTER INSERT OR UPDATE OR DELETE ON markets
  FOR EACH ROW EXECUTE FUNCTION notify_realtime_changes(); 