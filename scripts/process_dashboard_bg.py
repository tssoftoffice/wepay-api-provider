from PIL import Image
import os

def remove_white_background(input_path, output_path, tolerance=30):
    try:
        print(f"Processing {input_path}...")
        img = Image.open(input_path).convert("RGBA")
        datas = img.getdata()

        newData = []
        for item in datas:
            # item is a tuple (R, G, B, A)
            # Check if pixel is close to white
            if item[0] > 255 - tolerance and item[1] > 255 - tolerance and item[2] > 255 - tolerance:
                newData.append((255, 255, 255, 0))  # Transparent
            else:
                newData.append(item)

        img.putdata(newData)
        img.save(output_path, "PNG")
        print(f"Successfully saved transparent image to {output_path}")
    except Exception as e:
        print(f"Error processing {input_path}: {e}")

if __name__ == "__main__":
    # Feature 1: Rocket (Start)
    remove_white_background("public/feature_rocket_orange_raw.png", "public/feature_rocket_orange.png")
    
    # Feature 2: Auto System (Robot/Gears)
    remove_white_background("public/feature_auto_orange_raw.png", "public/feature_auto_orange.png")
    
    # Feature 3: Profit (Treasure/Graph)
    remove_white_background("public/feature_profit_orange_raw.png", "public/feature_profit_orange.png")
