# Dockerfile

# Use the official Python 3.11 slim base image
FROM python:3.11-slim

# Set the working directory
WORKDIR /app

# Copy the requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Expose port 8000
EXPOSE 8000

# Health check command
HEALTHCHECK CMD curl --fail http://127.0.0.1:8000/ || exit 1

# Command to run the application
CMD ["python", "app.py"]
