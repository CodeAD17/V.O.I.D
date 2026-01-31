# VOID Admin Dashboard

The visual control plane for the VOID system.

## Technology
- **React 18**
- **Vite**
- **TailwindCSS** (v4)
- **Lucide Icons**

## Setup

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Run**
    ```bash
    npm run dev
    ```
    The app runs on port `8080`.

## Configuration
The `vite.config.ts` handles API proxying:
```ts
server: {
  port: 8080,
  proxy: {
    '/api': 'http://localhost:3000',
    '/auth': 'http://localhost:3000'
  }
}
```
If your backend is on a different port, update this config.
