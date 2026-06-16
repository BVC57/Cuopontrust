/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          ink: "#0f172a",
          mist: "#f8fafc",
          primary: "#4f46e5",
          secondary: "#7c3aed",
          success: "#10b981",
          warning: "#f59e0b",
          danger: "#ef4444"
        }
      },
      boxShadow: {
        soft: "0 18px 45px rgba(15, 23, 42, 0.08)"
      },
      backgroundImage: {
        mesh: "radial-gradient(circle at top left, rgba(79,70,229,0.16), transparent 35%), radial-gradient(circle at bottom right, rgba(124,58,237,0.14), transparent 30%)"
      }
    }
  },
  plugins: []
};
