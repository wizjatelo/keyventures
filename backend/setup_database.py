import os
import subprocess
import sys

def run_command(command):
    print(f"Running: {command}")
    process = subprocess.run(command, shell=True, check=True)
    return process.returncode

def main():
    # Activate virtual environment if it exists
    if os.path.exists("venv"):
        if sys.platform == "win32":
            activate_cmd = "venv\\Scripts\\activate"
        else:
            activate_cmd = "source venv/bin/activate"
        print(f"Activating virtual environment: {activate_cmd}")
    
    try:
        # Make migrations
        run_command("python manage.py makemigrations")
        
        # Apply migrations
        run_command("python manage.py migrate")
        
        # Create superuser if needed
        create_superuser = input("Create superuser? (y/n): ")
        if create_superuser.lower() == 'y':
            run_command("python manage.py createsuperuser")
        
        # Populate database with sample data
        populate_data = input("Populate database with sample data? (y/n): ")
        if populate_data.lower() == 'y':
            run_command("python manage.py populate_customer_data")
        
        print("Database setup completed successfully!")
        
    except subprocess.CalledProcessError as e:
        print(f"Error: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())