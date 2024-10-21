import * as http from 'http';
import * as dotenv from 'dotenv';
import { parse } from 'url';
import { createUser, findUserById, updateUser, deleteUser, users } from './db';

dotenv.config();

const server = http.createServer(async (req, res) => {
  const { pathname } = parse(req.url || '', true);
  const userId = pathname?.split('/')[3];

  res.setHeader('Content-Type', 'application/json');

  try {
    if (req.method === 'GET' && pathname === '/api/users') {
      // GET all users
      res.writeHead(200);
      res.end(JSON.stringify(users));
    } else if (req.method === 'GET' && pathname.startsWith('/api/users/') && userId) {
      // GET a specific user
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(userId)) {
        res.writeHead(400);
        res.end(JSON.stringify({ message: 'Invalid userId' }));
        return;
      }
      const user = findUserById(userId);
      if (user) {
        res.writeHead(200);
        res.end(JSON.stringify(user));
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ message: 'User not found' }));
      }
    } else if (req.method === 'POST' && pathname === '/api/users') {
      // POST create a new user
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        const { username, age, hobbies } = JSON.parse(body);
        if (!username || !age || !Array.isArray(hobbies)) {
          res.writeHead(400);
          res.end(JSON.stringify({ message: 'Missing required fields' }));
          return;
        }
        const newUser = createUser(username, age, hobbies);
        res.writeHead(201);
        res.end(JSON.stringify(newUser));
      });
    } else if (req.method === 'PUT' && pathname.startsWith('/api/users/') && userId) {
      // PUT update a user
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(userId)) {
          res.writeHead(400);
          res.end(JSON.stringify({ message: 'Invalid userId' }));
          return;
        }
        const { username, age, hobbies } = JSON.parse(body);
        const updatedUser = updateUser(userId, username, age, hobbies);
        if (updatedUser) {
          res.writeHead(200);
          res.end(JSON.stringify(updatedUser));
        } else {
          res.writeHead(404);
          res.end(JSON.stringify({ message: 'User not found' }));
        }
      });
    } else if (req.method === 'DELETE' && pathname.startsWith('/api/users/') && userId) {
      // DELETE a user
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(userId)) {
        res.writeHead(400);
        res.end(JSON.stringify({ message: 'Invalid userId' }));
        return;
      }
      const deleted = deleteUser(userId);
      if (deleted) {
        res.writeHead(204);
        res.end();
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ message: 'User not found' }));
      }
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ message: 'Not Found' }));
    }
  } catch (error) {
    console.error(error);
    res.writeHead(500);
    res.end(JSON.stringify({ message: 'Internal Server Error' }));
  }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
