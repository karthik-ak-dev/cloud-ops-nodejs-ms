import Database from '../services/database';
import CacheService from '../services/cache';
import { Todo } from '../types';
import logger from '../utils/logger';

class TodoModel {
  private db: Database;
  private cache: CacheService;
  private readonly CACHE_TTL = 3600; // 1 hour in seconds
  
  constructor() {
    this.db = Database.getInstance();
    this.cache = CacheService.getInstance();
  }
  
  public async create(userId: number, title: string, description?: string): Promise<Todo | null> {
    try {
      const query = `
        INSERT INTO todos (title, description, user_id)
        VALUES ($1, $2, $3)
        RETURNING id, title, description, completed, user_id AS "userId", created_at AS "createdAt", updated_at AS "updatedAt"
      `;
      
      const result = await this.db.query<Todo>(query, [title, description || null, userId]);
      const newTodo = result[0] || null;
      
      if (newTodo) {
        // Invalidate user todos cache
        await this.cache.del(CacheService.getUserTodosCacheKey(userId));
      }
      
      return newTodo;
    } catch (error) {
      logger.error('Error creating todo:', error);
      throw error;
    }
  }
  
  public async findById(todoId: number): Promise<Todo | null> {
    try {
      // Try to get from cache first
      const cacheKey = CacheService.getTodoCacheKey(todoId);
      const cachedTodo = await this.cache.get<Todo>(cacheKey);
      
      if (cachedTodo) {
        logger.debug(`Todo ${todoId} retrieved from cache`);
        return cachedTodo;
      }
      
      // If not in cache, get from database
      const query = `
        SELECT id, title, description, completed, user_id AS "userId", created_at AS "createdAt", updated_at AS "updatedAt"
        FROM todos
        WHERE id = $1
      `;
      
      const result = await this.db.query<Todo>(query, [todoId]);
      const todo = result[0] || null;
      
      if (todo) {
        // Store in cache
        await this.cache.set(cacheKey, todo, this.CACHE_TTL);
      }
      
      return todo;
    } catch (error) {
      logger.error(`Error finding todo with ID ${todoId}:`, error);
      throw error;
    }
  }
  
  public async findByUserId(userId: number): Promise<Todo[]> {
    try {
      // Try to get from cache first
      const cacheKey = CacheService.getUserTodosCacheKey(userId);
      const cachedTodos = await this.cache.get<Todo[]>(cacheKey);
      
      if (cachedTodos) {
        logger.debug(`Todos for user ${userId} retrieved from cache`);
        return cachedTodos;
      }
      
      // If not in cache, get from database
      const query = `
        SELECT id, title, description, completed, user_id AS "userId", created_at AS "createdAt", updated_at AS "updatedAt"
        FROM todos
        WHERE user_id = $1
        ORDER BY created_at DESC
      `;
      
      const todos = await this.db.query<Todo>(query, [userId]);
      
      // Store in cache
      await this.cache.set(cacheKey, todos, this.CACHE_TTL);
      
      return todos;
    } catch (error) {
      logger.error(`Error finding todos for user ${userId}:`, error);
      throw error;
    }
  }
  
  public async update(todoId: number, userId: number, data: Partial<Todo>): Promise<Todo | null> {
    try {
      const fields = Object.keys(data).filter(key => {
        return ['title', 'description', 'completed'].includes(key);
      });
      
      if (fields.length === 0) {
        return null;
      }
      
      // Create SET part of the query
      const setClause = fields.map((field, index) => `${field} = $${index + 3}`).join(', ');
      const values = fields.map(field => data[field as keyof Todo]);
      
      const query = `
        UPDATE todos
        SET ${setClause}, updated_at = NOW()
        WHERE id = $1 AND user_id = $2
        RETURNING id, title, description, completed, user_id AS "userId", created_at AS "createdAt", updated_at AS "updatedAt"
      `;
      
      const result = await this.db.query<Todo>(query, [todoId, userId, ...values]);
      const updatedTodo = result[0] || null;
      
      if (updatedTodo) {
        // Update cache and invalidate user todos list
        const todoCacheKey = CacheService.getTodoCacheKey(todoId);
        const userTodosCacheKey = CacheService.getUserTodosCacheKey(userId);
        
        await this.cache.set(todoCacheKey, updatedTodo, this.CACHE_TTL);
        await this.cache.del(userTodosCacheKey);
      }
      
      return updatedTodo;
    } catch (error) {
      logger.error(`Error updating todo ${todoId}:`, error);
      throw error;
    }
  }
  
  public async delete(todoId: number, userId: number): Promise<boolean> {
    try {
      const query = `
        DELETE FROM todos
        WHERE id = $1 AND user_id = $2
        RETURNING id
      `;
      
      const result = await this.db.query(query, [todoId, userId]);
      const deleted = result.length > 0;
      
      if (deleted) {
        // Invalidate caches
        const todoCacheKey = CacheService.getTodoCacheKey(todoId);
        const userTodosCacheKey = CacheService.getUserTodosCacheKey(userId);
        
        await this.cache.del(todoCacheKey);
        await this.cache.del(userTodosCacheKey);
      }
      
      return deleted;
    } catch (error) {
      logger.error(`Error deleting todo ${todoId}:`, error);
      throw error;
    }
  }
  
  public async toggleCompleted(todoId: number, userId: number): Promise<Todo | null> {
    try {
      const query = `
        UPDATE todos
        SET completed = NOT completed, updated_at = NOW()
        WHERE id = $1 AND user_id = $2
        RETURNING id, title, description, completed, user_id AS "userId", created_at AS "createdAt", updated_at AS "updatedAt"
      `;
      
      const result = await this.db.query<Todo>(query, [todoId, userId]);
      const updatedTodo = result[0] || null;
      
      if (updatedTodo) {
        // Update cache and invalidate user todos list
        const todoCacheKey = CacheService.getTodoCacheKey(todoId);
        const userTodosCacheKey = CacheService.getUserTodosCacheKey(userId);
        
        await this.cache.set(todoCacheKey, updatedTodo, this.CACHE_TTL);
        await this.cache.del(userTodosCacheKey);
      }
      
      return updatedTodo;
    } catch (error) {
      logger.error(`Error toggling completed status for todo ${todoId}:`, error);
      throw error;
    }
  }
}

export default new TodoModel(); 