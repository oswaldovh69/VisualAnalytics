#Exploracion basica de datos de IRCA
directorio = "./"
setwd(directorio)

#Cargar datos
###Calidad del agua a nivel nacional
agua = read.csv("sivicap2015_completo.csv", header = T)
agua$AÑO = as.factor(agua$AÑO)
agua$RESULTADO.ORGANOFOSFORADOS.Y.CARBAMATOS = NULL
agua$RESULTADO.PLAGUICIDAS.TOTALES = NULL
agua$RESULTADO.CRYPTOSPORIDIUM = NULL
agua.work = data.frame(departamento = agua$DEPARTAMENTO, municipio = agua$MUNICIPO, muestras = agua$TOTAL.MUESTRAS, IRCA.promedio = agua$IRCA.PROMEDIO, riesgo = agua$NIVEL.DE.RIESGO.PROMEDIO)

#Para la visualización 1
##Gráfica de la mediana del IRCA vs. el departamento
###Ítems: Mediana del IRCA por departamento, Número de municipios por departamento, Municipio con el IRCA más alto, Municipio con IRCA más bajo
####Derivar los datos
agua_viz1_mediana.irca = aggregate(IRCA.promedio ~ departamento, agua.work, median)
agua_viz1_num.municipios = aggregate(municipio ~ departamento, agua.work, function(x){length(unique(x))})
colnames(agua_viz1_num.municipios)[2] = "municipiosDepartamento"

agua_viz1_irca.alto = aggregate(IRCA.promedio ~ departamento, agua.work, max)
temp = agua.work[agua.work$IRCA.promedio %in% agua_viz1_irca.alto$IRCA.promedio, c("departamento", "municipio")]
temp = subset(temp, !duplicated(departamento)) #Únicos municipios con bajo IRCA
agua_viz1_irca.alto = merge(temp, agua_viz1_irca.alto) #Asignación de los municipios
colnames(agua_viz1_irca.alto) = c("departamento", "municipioIRCAAlto", "IRCAMasAlto")

agua_viz1_irca.bajo = aggregate(IRCA.promedio ~ departamento, agua.work, min)
temp = agua.work[agua.work$IRCA.promedio %in% agua_viz1_irca.bajo$IRCA.promedio, c("departamento", "municipio")]
temp = subset(temp, !duplicated(departamento)) #Únicos municipios con bajo IRCA
agua_viz1_irca.bajo = merge(temp, agua_viz1_irca.bajo) #Asignación de los municipios
colnames(agua_viz1_irca.bajo) = c("departamento", "municipioIRCABajo", "IRCAMasBajo")

temp = merge(agua_viz1_mediana.irca, agua_viz1_irca.alto, by = "departamento")
temp2 = merge(agua_viz1_num.municipios, temp, by = "departamento")
agua.final = merge(temp2, agua_viz1_irca.bajo, by = "departamento")
write.csv(agua.final, file = "sivicap2015_viz1.csv", row.names = F)

#Para la visualización 2
##Gráfica de porcentaje de municipios por categoría del IRCA
###Ítems: Porcentaje de municipios por cada categoría, Número de municipios en esa categoría, 
####Derivar los datos
library(plyr)
agua_viz2 = count(agua.work, vars = c("departamento", "riesgo"))
agua_viz2_mod = data.frame(departamento = unique(agua_viz2$departamento), inviable = rep(0, length(unique(agua_viz2$departamento))), alto  = rep(0, length(unique(agua_viz2$departamento))), medio = rep(0, length(unique(agua_viz2$departamento))), bajo = rep(0, length(unique(agua_viz2$departamento))), sinRiesgo = rep(0, length(unique(agua_viz2$departamento))))
agua_viz2_mod = merge(agua_viz2_mod, agua_viz1_num.municipios)
write.csv(agua_viz2_mod, file = "sivicap2015_viz2.csv", row.names = F)