export default function TestStyles() {
  return (
    <div className="min-h-screen bg-secondary-50 p-8">
      <div className="container-custom">
        <h1 className="page-header text-gradient">Tailwind CSS Test Page</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Button Variants */}
          <div className="card">
            <h2 className="section-header">Buttons</h2>
            <div className="space-y-3">
              <button className="btn-primary w-full">Primary Button</button>
              <button className="btn-secondary w-full">Secondary Button</button>
              <button className="btn-danger w-full">Danger Button</button>
              <button className="btn-ghost w-full">Ghost Button</button>
            </div>
          </div>

          {/* Form Elements */}
          <div className="card">
            <h2 className="section-header">Form Elements</h2>
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="Enter your email"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="input-field input-error"
                  placeholder="Enter password"
                />
                <p className="form-error">Password is required</p>
              </div>
            </div>
          </div>

          {/* Alerts */}
          <div className="card">
            <h2 className="section-header">Alerts</h2>
            <div className="space-y-3">
              <div className="alert alert-success">Success message</div>
              <div className="alert alert-error">Error message</div>
              <div className="alert alert-warning">Warning message</div>
              <div className="alert alert-info">Info message</div>
            </div>
          </div>

          {/* Loading States */}
          <div className="card">
            <h2 className="section-header">Loading States</h2>
            <div className="flex items-center justify-center space-x-4">
              <div className="loading-spinner"></div>
              <div className="loading-dots">
                <div
                  className="loading-dot"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="loading-dot"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="loading-dot"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="card">
            <h2 className="section-header">Navigation</h2>
            <nav className="space-y-2">
              <a href="#" className="nav-link nav-link-active block">
                Active Link
              </a>
              <a href="#" className="nav-link block">
                Regular Link
              </a>
              <a href="#" className="nav-link block">
                Another Link
              </a>
            </nav>
          </div>

          {/* Colors Showcase */}
          <div className="card">
            <h2 className="section-header">Color Palette</h2>
            <div className="grid grid-cols-3 gap-2">
              <div className="h-8 bg-primary-500 rounded"></div>
              <div className="h-8 bg-secondary-500 rounded"></div>
              <div className="h-8 bg-success-500 rounded"></div>
              <div className="h-8 bg-danger-500 rounded"></div>
              <div className="h-8 bg-yellow-500 rounded"></div>
              <div className="h-8 bg-purple-500 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
