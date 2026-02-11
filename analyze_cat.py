import json
import os
from PIL import Image
import sys

# Increase recursion depth for deep flood fills
sys.setrecursionlimit(20000)

def find_bounding_boxes(image_path):
    print(f"Analyzing {image_path}...")
    try:
        img = Image.open(image_path).convert("RGBA")
    except Exception as e:
        print(f"Error opening {image_path}: {e}")
        return []

    width, height = img.size
    print(f"Image dimensions: {width}x{height}")
    
    pixels = img.load()
    visited = set()
    boxes = []

    # Iterative flood fill
    def get_connected_component(start_x, start_y):
        min_x, min_y = start_x, start_y
        max_x, max_y = start_x, start_y
        
        stack = [(start_x, start_y)]
        component_pixels = 0
        
        while stack:
            x, y = stack.pop()
            
            if x < min_x: min_x = x
            if x > max_x: max_x = x
            if y < min_y: min_y = y
            if y > max_y: max_y = y
            
            component_pixels += 1
            
            # Check 4 neighbors
            for nx, ny in [(x+1, y), (x-1, y), (x, y+1), (x, y-1)]:
                if 0 <= nx < width and 0 <= ny < height:
                    if (nx, ny) not in visited:
                        # Check alpha
                        if pixels[nx, ny][3] > 10:  # Threshold
                            visited.add((nx, ny))
                            stack.append((nx, ny))
        
        return {
            "x": min_x,
            "y": min_y,
            "w": max_x - min_x + 1,
            "h": max_y - min_y + 1,
            "area": component_pixels
        }

    # Scan image
    step = 5
    for y in range(0, height, step):
        for x in range(0, width, step):
            if (x, y) in visited:
                continue
            
            r, g, b, a = pixels[x, y]
            if a > 10:
                visited.add((x, y))
                box = get_connected_component(x, y)
                if box['w'] > 5 and box['h'] > 5: # Filter tiny noise
                    boxes.append(box)

    print(f"Found {len(boxes)} sprites")
    return boxes

def main():
    boxes = find_bounding_boxes("public/village/cat.png")
    
    with open("cat_sprites.json", "w") as f:
        json.dump(boxes, f, indent=2)
    
    print("Saved cat_sprites.json")

if __name__ == "__main__":
    main()
