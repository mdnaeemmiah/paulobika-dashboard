export type DogInfoRow = {
  id: string;
  breed: string;
  healthIssues: string;
  foodAllergies: string;
  foodType: string;
};

export const DOG_INFO_PAGE_SIZE = 10;

export const DOG_INFO_ROWS: DogInfoRow[] = [
  {
    id: "1",
    breed: "Golden Retriever",
    healthIssues: "Joint Issues",
    foodAllergies: "Chicken",
    foodType: "Dry Food",
  },
  {
    id: "2",
    breed: "Labrador",
    healthIssues: "Obesity",
    foodAllergies: "Beef",
    foodType: "Wet Food",
  },
  {
    id: "3",
    breed: "Bulldog",
    healthIssues: "Diabetes",
    foodAllergies: "Wheat",
    foodType: "Fresh Food",
  },
  {
    id: "4",
    breed: "German Shepherd",
    healthIssues: "Sensitive Stomach",
    foodAllergies: "Corn",
    foodType: "Prescription",
  },
  {
    id: "5",
    breed: "Rottweiler",
    healthIssues: "Skin Allergies",
    foodAllergies: "Fish",
    foodType: "Dry Food",
  },
  {
    id: "6",
    breed: "Boxer",
    healthIssues: "Dental Issues",
    foodAllergies: "Egg",
    foodType: "Wet Food",
  },
  {
    id: "7",
    breed: "Beagle",
    healthIssues: "Heart Disease",
    foodAllergies: "Soy",
    foodType: "Fresh Food",
  },
  {
    id: "8",
    breed: "Husky",
    healthIssues: "None",
    foodAllergies: "Dairy",
    foodType: "Prescription",
  },
  {
    id: "9",
    breed: "Poodle",
    healthIssues: "None",
    foodAllergies: "None",
    foodType: "Fresh Food",
  },
  {
    id: "10",
    breed: "Other",
    healthIssues: "None",
    foodAllergies: "None",
    foodType: "Dry Food",
  },
  {
    id: "11",
    breed: "Shih Tzu",
    healthIssues: "Sensitive Stomach",
    foodAllergies: "Soy",
    foodType: "Wet Food",
  },
  {
    id: "12",
    breed: "Dalmatian",
    healthIssues: "Joint Issues",
    foodAllergies: "Corn",
    foodType: "Prescription",
  },
];

export const DOG_INFORMATION_OPTIONS = {
  breed: [
    "Golden Retriever",
    "Labrador",
    "Bulldog",
    "German Shepherd",
    "Rottweiler",
    "Boxer",
    "Beagle",
    "Husky",
    "Poodle",
    "Other",
  ],
  healthIssues: [
    "Joint Issues",
    "Obesity",
    "Diabetes",
    "Sensitive Stomach",
    "Skin Allergies",
    "Dental Issues",
    "Heart Disease",
    "None",
  ],
  foodAllergies: ["Chicken", "Beef", "Wheat", "Corn", "Fish", "Egg", "Soy", "Dairy", "None"],
  foodType: ["Dry Food", "Wet Food", "Fresh Food", "Prescription"],
} as const;
