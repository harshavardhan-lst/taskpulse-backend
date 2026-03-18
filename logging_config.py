import logging
import os


class JsonFormatter(logging.Formatter):
    def format(self, record):
        log_obj = {"level": record.levelname,
                   "time": self.formatTime(record, self.datefmt),
                   "name": record.name,
                   "message": record.getMessage()}
        if record.exc_info:
            log_obj["exception"] = self.formatException(record.exc_info)
        return log_obj


def setup_logging(log_level=logging.INFO):
    # Setting up the logging configuration
    log_file = os.getenv('LOG_FILE', 'app.log')
    logging.basicConfig(level=log_level,
                        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
                        handlers=[
                            logging.FileHandler(log_file),
                            logging.StreamHandler()
                        ])
    # Update the default logger with JSON formatter
    for handler in logging.getLogger().handlers:
        handler.setFormatter(JsonFormatter())


if __name__ == "__main__":
    setup_logging()  # Call to set up logging when the script runs directly
