-- Run this SQL command in your MySQL database to fix the food_type column size
ALTER TABLE foods MODIFY COLUMN food_type VARCHAR(500); 