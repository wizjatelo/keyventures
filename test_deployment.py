#!/usr/bin/env python3
"""
Test script to verify LineMart deployment readiness
Run this before deploying to catch any issues early
"""

import os
import sys
import subprocess
import json
from pathlib import Path

def check_file_exists(file_path, description):
    """Check if a file exists and report status"""
    if os.path.exists(file_path):
        print(f"✅ {description}: {file_path}")
        return True
    else:
        print(f"❌ {description}: {file_path} - NOT FOUND")
        return False

def check_directory_structure():
    """Verify the project directory structure"""
    print("🔍 Checking directory structure...")
    
    required_files = [
        ("backend/manage.py", "Django manage.py"),
        ("backend/requirements.txt", "Python requirements"),
        ("backend/build.sh", "Build script"),
        ("backend/config/settings.py", "Django settings"),
        ("linemart-frontend/package.json", "Frontend package.json"),
        ("linemart-frontend/src/App.js", "React App component"),
        ("render.yaml", "Render configuration"),
    ]
    
    all_good = True
    for file_path, description in required_files:
        if not check_file_exists(file_path, description):
            all_good = False
    
    return all_good

def check_backend_requirements():
    """Check if all required Python packages are listed"""
    print("\n🐍 Checking Python requirements...")
    
    requirements_file = "backend/requirements.txt"
    if not os.path.exists(requirements_file):
        print("❌ requirements.txt not found")
        return False
    
    with open(requirements_file, 'r') as f:
        requirements = f.read().lower()
    
    required_packages = [
        'django',
        'djangorestframework',
        'psycopg2-binary',
        'dj-database-url',
        'whitenoise',
        'gunicorn',
        'django-cors-headers'
    ]
    
    all_good = True
    for package in required_packages:
        if package in requirements:
            print(f"✅ {package} found in requirements")
        else:
            print(f"❌ {package} missing from requirements")
            all_good = False
    
    return all_good

def check_frontend_dependencies():
    """Check if frontend has required dependencies"""
    print("\n📦 Checking frontend dependencies...")
    
    package_json_file = "linemart-frontend/package.json"
    if not os.path.exists(package_json_file):
        print("❌ package.json not found")
        return False
    
    try:
        with open(package_json_file, 'r') as f:
            package_data = json.load(f)
        
        dependencies = package_data.get('dependencies', {})
        required_deps = ['react', 'react-dom', 'react-router-dom', 'axios']
        
        all_good = True
        for dep in required_deps:
            if dep in dependencies:
                print(f"✅ {dep} found in dependencies")
            else:
                print(f"❌ {dep} missing from dependencies")
                all_good = False
        
        return all_good
    except json.JSONDecodeError:
        print("❌ Invalid package.json format")
        return False

def check_environment_files():
    """Check for environment configuration files"""
    print("\n🔧 Checking environment configuration...")
    
    env_files = [
        ("backend/.env.example", "Backend environment template"),
        ("render.yaml", "Render deployment config"),
    ]
    
    all_good = True
    for file_path, description in env_files:
        if not check_file_exists(file_path, description):
            all_good = False
    
    return all_good

def check_build_script():
    """Check if build script is properly configured"""
    print("\n🔨 Checking build script...")
    
    build_script = "backend/build.sh"
    if not os.path.exists(build_script):
        print("❌ build.sh not found")
        return False
    
    with open(build_script, 'r') as f:
        content = f.read()
    
    required_commands = [
        'pip install',
        'collectstatic',
        'migrate'
    ]
    
    all_good = True
    for command in required_commands:
        if command in content:
            print(f"✅ {command} found in build script")
        else:
            print(f"❌ {command} missing from build script")
            all_good = False
    
    return all_good

def check_django_settings():
    """Check Django settings for production readiness"""
    print("\n⚙️ Checking Django settings...")
    
    settings_file = "backend/config/settings.py"
    if not os.path.exists(settings_file):
        print("❌ Django settings not found")
        return False
    
    with open(settings_file, 'r') as f:
        content = f.read()
    
    required_settings = [
        'DATABASE_URL',
        'ALLOWED_HOSTS',
        'STATIC_ROOT',
        'WhiteNoiseMiddleware',
        'psycopg2'
    ]
    
    all_good = True
    for setting in required_settings:
        if setting in content:
            print(f"✅ {setting} configured in settings")
        else:
            print(f"❌ {setting} missing from settings")
            all_good = False
    
    return all_good

def main():
    """Main test function"""
    print("🚀 LineMart Deployment Readiness Test")
    print("=" * 50)
    
    # Change to project directory
    project_root = Path(__file__).parent
    os.chdir(project_root)
    
    tests = [
        check_directory_structure,
        check_backend_requirements,
        check_frontend_dependencies,
        check_environment_files,
        check_build_script,
        check_django_settings
    ]
    
    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
        except Exception as e:
            print(f"❌ Test failed with error: {e}")
            results.append(False)
    
    print("\n" + "=" * 50)
    print("📊 SUMMARY")
    print("=" * 50)
    
    passed = sum(results)
    total = len(results)
    
    if all(results):
        print("🎉 ALL TESTS PASSED! Ready for deployment!")
        print("\n📋 Next steps:")
        print("1. Push code to GitHub")
        print("2. Connect repository to Render")
        print("3. Deploy using the render.yaml configuration")
        return 0
    else:
        print(f"⚠️ {passed}/{total} tests passed. Please fix the issues above before deploying.")
        print("\n🔧 Common fixes:")
        print("- Ensure all required files are present")
        print("- Check file paths and directory structure")
        print("- Verify all dependencies are listed")
        print("- Review Django settings for production")
        return 1

if __name__ == "__main__":
    sys.exit(main())