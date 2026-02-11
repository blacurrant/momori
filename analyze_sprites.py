import json
import os
from PIL import Image
import sys

# Increase recursion depth for deep flood fills
sys.setrecursionlimit(20000)

def find_bounding_boxes(image_path, sheet_offset_x=0, sheet_offset_y=0):
    print(f"Analyzing {image_path}...")
    try:
        img = Image.open(image_path).convert("RGBA")
    except Exception as e:
        print(f"Error opening {image_path}: {e}")
        return []

    width, height = img.size
    pixels = img.load()
    visited = set()
    boxes = []

    # Helper for iterative flood fill to avoid recursion limits
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
                        if pixels[nx, ny][3] > 10:  # Threshold for transparency
                            visited.add((nx, ny))
                            stack.append((nx, ny))
        
        return {
            "x": min_x + sheet_offset_x,
            "y": min_y + sheet_offset_y,
            "w": max_x - min_x + 1,
            "h": max_y - min_y + 1,
            "area": component_pixels
        }

    # Scan image
    step = 5 # Optimization: Skip pixels to find starts faster, but might miss tiny debris
    for y in range(0, height, step):
        for x in range(0, width, step):
            if (x, y) in visited:
                continue
            
            r, g, b, a = pixels[x, y]
            if a > 10:
                # Found a new object
                visited.add((x, y))
                # Do a precise fill from here
                box = get_connected_component(x, y)
                # Filter noise
                if box['w'] > 10 and box['h'] > 10:
                    boxes.append(box)

    print(f"Found {len(boxes)} sprites in {image_path}")
    return boxes

def main():
    base_path = "public/village"
    
    # Sheet 1 is Terrain (Grid), so we skip it or handle differently.
    # We focus on Props (Sheet 2) and Buildings (Sheet 3)
    
    # Sheet 2: Props (Offset x=2560 in combined sheet)
    sheet2_boxes = find_bounding_boxes(os.path.join(base_path, "Isometric Assets 2.png"), 0, 0)
    
    # Sheet 3: Buildings (Offset x=5120 in combined sheet)
    sheet3_boxes = find_bounding_boxes(os.path.join(base_path, "Isometric Assets 3.png"), 0, 0)

    # Sheet 4: Wagon/Vehicles (Offset x=0, y=2560 in combined sheet)
    sheet4_boxes = find_bounding_boxes(os.path.join(base_path, "Isometric Assets 4.png"), 0, 0)
    
    all_data = {
        "props": sheet2_boxes,
        "buildings": sheet3_boxes,
        "vehicles": sheet4_boxes
    }
    
    with open("detected_sprites.json", "w") as f:
        json.dump(all_data, f, indent=2)
    
    print("Saved detected_sprites.json")

if __name__ == "__main__":
    main()
