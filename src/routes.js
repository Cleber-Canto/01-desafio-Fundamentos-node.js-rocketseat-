import { randomUUID } from 'node:crypto';
import { Database } from './database.js';
import { buildRoutePath } from './utils/build-route-path.js';

const database = new Database;

export const routes = [
    {
        method: 'POST',
        path: buildRoutePath('/tasks'),
        handler: (request, response) => {
          try {
            const { title, description } = request.body;
      
            // Verifica se o título e a descrição foram fornecidos
            if (!title || !description) {
              return response.writeHead(422).end(JSON.stringify({
                message: "Title and description are required."
              }));
            }
      
            const task = {
              id: randomUUID(),
              title,
              description,
              completed_at: null,
              created_at: new Date().toISOString(), // Formato ISO para data
              updated_at: new Date().toISOString(), // Formato ISO para data
            };
      
            // Adiciona a nova tarefa ao banco de dados
            database.insert('tasks', task);
      
            // Retorna uma resposta de sucesso
            return response.writeHead(201).end(JSON.stringify({
              message: "Task created successfully.",
              task
            }));
          } catch (error) {
            // Em caso de erro, retorna uma resposta de erro
            console.error('Error:', error);
            return response.writeHead(500).end(JSON.stringify({
              message: 'Internal Server Error'
            }));
          }
        }
      }
      ,
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (request, response) => {
      const { search } = request.query;

      const tasks = database.select(
        'tasks',
        search
          ? { title: search, description: search, }
          : null
      );

      return response
        .end(JSON.stringify(tasks));
    }
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (request, response) => {
      try {
        const { id } = request.params;
        const { title, description } = request.body;
  
        const existingTask = database.select('tasks', { id });
  
        if (existingTask.length < 1) {
          return response.writeHead(404).end(JSON.stringify({
            message: "Requested task not found."
          }));
        }
  
        if (!title || !description) {
          return response.writeHead(422).end(JSON.stringify({
            message: "Title and description are required."
          }));
        }
  
        database.update('tasks', id, {
          title,
          description,
          updated_at: new Date().toISOString(), // Formato ISO para data
        });
  
        return response.writeHead(200).end(JSON.stringify({
          message: "Task updated successfully."
        }));
      } catch (error) {
        console.error('Error:', error);
        return response.writeHead(500).end(JSON.stringify({
          message: 'Internal Server Error'
        }));
      }
    }
  },

  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (request, response) => {
      try {
        const { id } = request.params;
  
        const existingTask = database.select('tasks', { id });
  
        if (existingTask.length < 1) {
          return response.writeHead(404).end(JSON.stringify({
            message: "Requested task not found."
          }));
        }
  
        database.delete('tasks', id);
  
        return response.writeHead(200).end(JSON.stringify({
          message: "Task deleted successfully."
        }));
      } catch (error) {
        console.error('Error:', error);
        return response.writeHead(500).end(JSON.stringify({
          message: 'Internal Server Error'
        }));
      }
    }
  }, 

  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id'),
    handler: (request, response) => {
      try {
        const { id } = request.params;
  
        const task = database.findOne('tasks', id);
  
        if (!task) {
          return response.writeHead(404).end(JSON.stringify({ message: 'Task not found!' }));
        }
  
        task.completed_at = task.completed_at ? null : new Date();
        task.updated_at = new Date();
  
        database.update('tasks', task.id, task);
  
        return response.writeHead(204).end();
      } catch (error) {
        console.error('Error:', error);
        return response.writeHead(500).end(JSON.stringify({ message: 'Internal Server Error' }));
      }
    }
  }
  

]