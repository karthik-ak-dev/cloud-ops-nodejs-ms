import Database from '../services/database';
import { User } from '../types';
import bcrypt from 'bcrypt';
import logger from '../utils/logger';

class UserModel {
  private db: Database;
  
  constructor() {
    this.db = Database.getInstance();
  }
  
  public async create(username: string, email: string, password: string): Promise<User | null> {
    try {
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      const query = `
        INSERT INTO users (username, email, password)
        VALUES ($1, $2, $3)
        RETURNING id, username, email, password, created_at, updated_at
      `;
      
      const result = await this.db.query<User>(query, [username, email, hashedPassword]);
      return result[0] || null;
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }
  
  public async findByEmail(email: string): Promise<User | null> {
    try {
      const query = `
        SELECT id, username, email, password, created_at, updated_at
        FROM users
        WHERE email = $1
      `;
      
      const result = await this.db.query<User>(query, [email]);
      return result[0] || null;
    } catch (error) {
      logger.error('Error finding user by email:', error);
      throw error;
    }
  }
  
  public async findById(id: number): Promise<User | null> {
    try {
      const query = `
        SELECT id, username, email, password, created_at, updated_at
        FROM users
        WHERE id = $1
      `;
      
      const result = await this.db.query<User>(query, [id]);
      return result[0] || null;
    } catch (error) {
      logger.error('Error finding user by ID:', error);
      throw error;
    }
  }
  
  public async updateUser(id: number, userData: Partial<User>): Promise<User | null> {
    try {
      const fields = Object.keys(userData).filter(key => key !== 'id' && key !== 'password');
      
      if (fields.length === 0) {
        return null;
      }
      
      // Create SET part of the query
      const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
      const values = fields.map(field => userData[field as keyof User]);
      
      const query = `
        UPDATE users
        SET ${setClause}, updated_at = NOW()
        WHERE id = $1
        RETURNING id, username, email, created_at, updated_at
      `;
      
      const result = await this.db.query<User>( query, [id, ...values]);
      return result[0] || null;
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }
  
  public async changePassword(id: number, newPassword: string): Promise<boolean> {
    try {
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      const query = `
        UPDATE users
        SET password = $2, updated_at = NOW()
        WHERE id = $1
      `;
      
      await this.db.query(query, [id, hashedPassword]);
      return true;
    } catch (error) {
      logger.error('Error changing password:', error);
      throw error;
    }
  }
  
  public async deleteUser(id: number): Promise<boolean> {
    try {
      const query = `
        DELETE FROM users
        WHERE id = $1
      `;
      
      await this.db.query(query, [id]);
      return true;
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw error;
    }
  }
  
  public async verifyPassword(user: User, password: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, user.password);
    } catch (error) {
      logger.error('Error verifying password:', error);
      return false;
    }
  }
}

export default new UserModel();