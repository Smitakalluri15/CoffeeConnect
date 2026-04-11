# Web-Based Coffee Ordering and Management Platform

(Their description...)

(Your description...)

## Frontend env setup

Create a file named `.env` in `/Users/smitakalluri/Documents/New project/frontend` using this template:

```env
VITE_API_BASE=http://localhost:8080/api
VITE_PAYMENT_MODE=RAZORPAY
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_javascript_api_key
```

For the cafe detail page map, enable **Maps JavaScript API** for your key and add an HTTP referrer restriction for your frontend host, for example:

- `http://localhost:5173/*`

After adding the key, restart Vite:

```bash
npm run dev
```
