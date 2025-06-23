-- First, let's check if the table exists and its structure
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('movie-dataset', 'movie_dataset') 
ORDER BY table_name, ordinal_position;
