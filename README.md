# TechType-challenge
solution for https://github.com/TechTypeGroup/backend-challenge by Ravi Bhatt, July 2025

# PC Node Service API

REST API for managing hierarchical PC components.

## Setup & Run

```bash
npm install
npm run dev
```

API runs at `http://localhost:3000`

## API Usage

**Create Node:**
```bash
 POST http://localhost:3000/api/nodes 
```

**Add Property:**
```bash
 POST http://localhost:3000/api/nodes/MyPC/properties 
```

**Get Tree:**
```bash
GET http://localhost:3000/api/nodes/MyPC/subtree
```

## Testing

```bash
npm run test
```

Done!