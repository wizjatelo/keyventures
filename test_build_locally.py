#!/usr/bin/env python3
"""
Local build test script to verify deployment readiness
"""
import os
import subprocess
import sys
from pathlib import Path

def run_command(command, cwd=None):
    """Run a command and return success status"""
    try:
        result = subprocess.run(command, shell=True, cwd=cwd, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ {command}")
            return True
        else:
            print(f"❌ {command}")
            print(f"Error: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ {command} - Exception: {e}")
        return False

def main():
    print("🧪 LineMart Local Build Test")
    print("=" * 50)
    
    # Get project root
    project_root = Path(__file__).parent
    frontend_dir = project_root / "linemart-frontend"
    backend_dir = project_root / "backend"
    
    print(f"📁 Project root: {project_root}")
    print(f"📁 Frontend dir: {frontend_dir}")
    print(f"📁 Backend dir: {backend_dir}")
    
    # Test frontend build
    print("\n🔨 Testing Frontend Build...")
    if frontend_dir.exists():
        # Check if node_modules exists
        node_modules = frontend_dir / "node_modules"
        if not node_modules.exists():
            print("📦 Installing frontend dependencies...")
            if not run_command("npm install", cwd=frontend_dir):
                print("❌ Frontend dependency installation failed")
                return False
        
        # Test build
        print("🏗️ Building frontend...")
        if run_command("npm run build", cwd=frontend_dir):
            build_dir = frontend_dir / "build"
            if build_dir.exists():
                print("✅ Frontend build successful")
                print(f"📦 Build size: {sum(f.stat().st_size for f in build_dir.rglob('*') if f.is_file()) / 1024:.1f} KB")
            else:
                print("❌ Build directory not created")
                return False
        else:
            print("❌ Frontend build failed")
            return False
    else:
        print("❌ Frontend directory not found")
        return False
    
    # Test backend setup
    print("\n🐍 Testing Backend Setup...")
    if backend_dir.exists():
        # Check requirements
        requirements_file = backend_dir / "requirements.txt"
        if requirements_file.exists():
            print("✅ Requirements file found")
        else:
            print("❌ Requirements file not found")
            return False
        
        # Check manage.py
        manage_py = backend_dir / "manage.py"
        if manage_py.exists():
            print("✅ Django manage.py found")
        else:
            print("❌ Django manage.py not found")
            return False
        
        # Check settings
        settings_file = backend_dir / "config" / "settings.py"
        if settings_file.exists():
            print("✅ Django settings found")
        else:
            print("❌ Django settings not found")
            return False
    else:
        print("❌ Backend directory not found")
        return False
    
    # Check render.yaml
    print("\n☁️ Testing Deployment Configuration...")
    render_yaml = project_root / "render.yaml"
    if render_yaml.exists():
        print("✅ render.yaml found")
        with open(render_yaml, 'r') as f:
            content = f.read()
            if "linemart-frontend" in content and "linemart-backend" in content:
                print("✅ render.yaml contains both frontend and backend services")
            else:
                print("⚠️ render.yaml may be incomplete")
    else:
        print("❌ render.yaml not found")
        return False
    
    print("\n" + "=" * 50)
    print("🎉 ALL LOCAL TESTS PASSED!")
    print("\n📋 Deployment Checklist:")
    print("1. ✅ Frontend builds successfully")
    print("2. ✅ Backend configuration ready")
    print("3. ✅ Deployment configuration present")
    print("\n🚀 Ready for deployment!")
    print("\n⚠️ IMPORTANT: Make sure you're deploying from the correct GitHub repository!")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)