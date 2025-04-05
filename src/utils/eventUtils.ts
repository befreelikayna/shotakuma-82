
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
};

export const extractTime = (dateString: string): string | null => {
  try {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch (e) {
    return null;
  }
};

export const validateCategory = (category: string): "anime" | "manga" | "cosplay" | "gaming" | "culture" => {
  const validCategories = ["anime", "manga", "cosplay", "gaming", "culture"];
  return validCategories.includes(category) 
    ? category as "anime" | "manga" | "cosplay" | "gaming" | "culture" 
    : "culture";
};
