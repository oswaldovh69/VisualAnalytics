###Setting working directory
directory = "/home/david/BCEMSync/03_Visual_Analytics/05_arbol_jerarquia"
setwd(directory)

##Importing Titanic Data (Jerarquía: Sobrevivieron, Sexo, Edad, Clase)
data = read.csv("titanic_summarized.csv", header = T)

##Creating a data.tree
library(data.tree)
data$pathString = paste("Survived", data$Survived, data$Sex, data$Age, data$Class, sep = "/")
hierarchy.tree = as.Node(data)
print(hierarchy.tree, "Number")

##Converting to JSON
library(jsonlite)
hierarchy.tree = ToListExplicit(hierarchy.tree, unname = TRUE)
json.hierarchy = toJSON(hierarchy.tree, pretty = TRUE)
cat(json.hierarchy)
write(json.hierarchy, file = "titanic_tree_2.json")

##See topology
library(networkD3)
diagonalNetwork(hierarchy.tree)
