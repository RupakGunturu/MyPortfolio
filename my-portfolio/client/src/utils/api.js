let API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

if (!API_BASE_URL) {
  if (window.location.hostname === 'localhost') {
    API_BASE_URL = 'http://localhost:9000';
  } else {
    // Always use your Render backend in production
    API_BASE_URL = 'https://myportfolio-a1y8.onrender.com';
  }
}

export default API_BASE_URL; 