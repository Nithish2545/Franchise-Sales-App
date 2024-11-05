 function getCollection() {
  const franchiseLocation = JSON.parse(
    localStorage.getItem("FranchiseLogin")
  ).FranchiseLocation;
  const collectionName =
    franchiseLocation === "PONDY"
      ? "franchise_pondy"
      : franchiseLocation === "COIMBATORE"
      ? "franchise_coimbatore"
      : "default_collection";
  return collectionName;
}

 function getFranchiseBasedAWb() {
  const franchiseLocation = JSON.parse(
    localStorage.getItem("FranchiseLogin")
  ).FranchiseLocation;
  const collectionName =
    franchiseLocation === "PONDY"
      ? 2000
      : franchiseLocation === "COIMBATORE"
      ? 3000
      : 1000;
  return collectionName;
}

export default {
  getCollection: getCollection,
  getFranchiseBasedAWb: getFranchiseBasedAWb,
};