export type GarmentPhoto = {
  previewUrl: string;
};

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const MAX_DIMENSION = 900;

function readFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () =>
      reject(
        new Error("We could not read that file. Please try another photo.")
      );
    reader.onload = () =>
      typeof reader.result === "string"
        ? resolve(reader.result)
        : reject(
            new Error("We could not read that file. Please try another photo.")
          );
    reader.readAsDataURL(file);
  });
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onerror = () =>
      reject(new Error("We could not open that image. Try a JPG or PNG."));
    image.onload = () => resolve(image);
    image.src = source;
  });
}

export async function processGarmentPhoto(file: File): Promise<GarmentPhoto> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file (JPG or PNG).");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("That photo is too large. Please use one under 15 MB.");
  }

  const image = await loadImage(await readFile(file));
  const scale = Math.min(
    1,
    MAX_DIMENSION / Math.max(image.width, image.height)
  );
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error(
      "We could not prepare that photo. Please try another image."
    );
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return { previewUrl: canvas.toDataURL("image/jpeg", 0.75) };
}
