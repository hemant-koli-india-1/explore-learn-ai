-- Add coordinates to locations table for Google Maps navigation
ALTER TABLE public.locations 
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8);

-- Insert sample location data with coordinates for Electronics Department  
INSERT INTO public.locations (
    location_id, name, description, location, order_index, course_id, 
    latitude, longitude
) VALUES 
(1, 'Power Supply Systems', 'Learn about electrical systems, power distribution, and safety protocols', 'Building A, Floor 2, Electronics Department', 1, 1, 40.7128, -74.0060),
(2, 'Customer Engagement Desk', 'Master customer service protocols and communication standards', 'Building A, Floor 2, Customer Service Area', 2, 1, 40.7130, -74.0058),
(3, 'Returns & Warranty Center', 'Understand return policies, warranty procedures, and documentation', 'Building A, Floor 1, Returns Department', 3, 1, 40.7125, -74.0062)
ON CONFLICT (location_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    location = EXCLUDED.location,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude;