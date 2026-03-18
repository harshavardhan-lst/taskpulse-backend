class Settings:
    def __init__(self):
        self.database_url = "postgresql://user:password@localhost/dbname"
        self.cors_origins = ["https://example.com", "https://anotherexample.com"]
        self.api_keys = {
            "service1": "your_api_key_1",
            "service2": "your_api_key_2"
        }
        self.environment = "development"  # Change to "production" in production environment

    def get_database_url(self):
        return self.database_url

    def get_cors_origins(self):
        return self.cors_origins

    def get_api_keys(self):
        return self.api_keys

    def is_production(self):
        return self.environment == "production"

# Usage
# settings = Settings()
# print(settings.get_database_url())
