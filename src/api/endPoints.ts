// src/api/endpoints.js

export const ENDPOINTS = {
  BASEURL: process.env.NEXT_PUBLIC_API_URL,

  registration: "/accounts/user/register/",
  login: "/accounts/user/login/",
  verifyOtp: "/accounts/user/verify-otp/",
  resendOtp: "/accounts/user/resend-otp/",

  forgetPassword: "/accounts/user/send-reset-password-email/",
  reSetPassword: "/accounts/user/reset-password-otp/",
  setNewPassword: "/accounts/user/set-new-password/",

  getUsers: "/core/admin/users/",
  grapthData: (year: string | number) => `/core/admin/users/trends/${year}/`,
   
  terms:'/core/settings/terms/',
  privacy:'/core/settings/privacy/',
  faq:'/core/settings/faq/',






  dogBreeds: "/core/dog-breeds/",
  dogFood: "/core/food-preferences/",
  dogHealth: "/core/health-issues/",
  foodAllergies: "/core/food-allergies/",

  dogInfo: "/core/dog-info/",
  addProduct: "/core/foods/",
  addProductDetail: (dynamic: string | number) => `/core/foods/${dynamic}/`,
  addRating: "/core/foods/",
  addRatingDetail: (foodId: string | number) =>
    `/core/foods/${foodId}/reviews/`,
  patchRatingDetail: (foodId: string | number, reviewId: string | number) =>
    `/core/foods/${foodId}/reviews/${reviewId}/`,

  recommendFood: "/core/foods/recommendations/",

  getUser: "/accounts/user/profile/",
  updateProfile: "/accounts/user/profile/",

  getWishList: "/core/wishlist/",
  addWishList: "/core/wishlist/",
  deleteWishList: (foodId: string | number) => `/core/wishlist/${foodId}/`,

  categoryFood: (categoryId: string | number) =>
    `/core/foods/filter/?category_id=${categoryId}`,

  getProductDeals: "/core/product-deals/",

  productDetails: (offerId: string | number) =>
    `/core/product-deals/${offerId}/`,

  privacyPolicy: "/core/pages/privacy-policy/",
  termsOfService: "/core/pages/terms-and-conditions/",
  about: "/core/pages/about-us/",

  passwordChange: "/accounts/user/change-password/",
  deleteAccount: "/accounts/user/delete-account/",

  userManagement: "/core/admin/users/",
  userDetails: (userId: string | number) => `/core/admin/users/${userId}/`,
  deleteUser: (userId: string | number) => `/core/admin/users/${userId}/`,
  dogInfos: "/core/admin/users/7/",
  totalUsers: "/core/admin/stats/",
  graphData: (year: string | number) => `/core/admin/users/trends/${year}/`,

  calculate: "/core/calculator/custom-food/",

  withoutLoginCalculation: "/core/calculator/guest-custom-food/",

  aiDataUrl: "/core/recommend/",
};
