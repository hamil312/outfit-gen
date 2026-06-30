Aplicación para la generación de atuendos a través de un algoritmo teniendo en cuenta las 

preferencias del usuario y su inventario de ropa 

Hamilton Santiago Insandara Alvarez Mario Fernando Santacruz Pantoja 

Universidad Cooperativa de Colombia 

**==> picture [50 x 12] intentionally omitted <==**

Ingeniería de Software 

Pasto 

2025 

Aplicación para la generación de atuendos a través de un algoritmo teniendo en cuenta las 

preferencias del usuario y su inventario de ropa 

Hamilton Santiago Insandara Alvarez 

Mario Fernando Santacruz Pantoja 

Informe Final para optar el título de Ingeniero de Software 

Oscar Osorio 

Universidad Cooperativa de Colombia 

Ingeniería 

Ingeniería de Software 

Pasto 

2025 

1 

## **TABLA DE CONTENIDO** 

|**INTRODUCCIÓN**<br>**Pág.**||
|---|---|
|**1.**PROBLEMA DE LA INVESTIGACIÓN<br>4||
|**1.1.**<br>OBJETO O TEMA DE INVESTIGACIÓN<br>5||
|**1.2.**<br>ÁREA DE INVESTIGACIÓN<br>5||
|**1.3.**<br>LÍNEA DE INVESTIGACIÓN<br>5||
|**1.4.**<br>PLANTEAMIENTO DEL PROBLEMA<br>5||
|**1.5.**<br>FORMULACIÓN DEL PROBLEMA<br>5||
|**1.6.**<br>OBJETIVOS DE LA INVESTIGACIÓN<br>7||
|**1.6.1.**Objetivo general<br>7||
|**1.6.2.**Objetivos específicos<br>7||
|**1.7.**<br>JUSTIFICACIÓN<br>8||
|**1.8.**<br>DELIMITACIÓN<br>9||
|**2.**MARCO TEÓRICO<br>9||
|**2.1.**<br>ANTECEDENTES<br>9||
|**2.2.**<br>TEORÍAS GENERALES DEL PROYECTO<br>12||
|**2.3.**<br>FORMULACIÓN DE HIPÓTESIS<br>25||
|**3.**METODOLOGÍA DE DESARROLLO DE SOFTWARE<br>25||
|**4.**RESULTADOS DE LA INVESTIGACIÓN<br>35||
|**4.1.**<br>LEVANTAMIENTO DE REQUERIMIENTOS<br>35||
|**4.1.1.**REQUISITOS FUNCIONALES<br>35||
|**4.1.2.**REQUISITOS NO FUNCIONALES<br>39||
|**4.2.**ANÁLISIS DE SOFTWARE<br>40||



2 

||**4.2.1.**MODELO DEL APLICATIVO SEGÚN UML 25<br>40|
|---|---|
||**4.2.1.1.**DIAGRAMA DE CONTEXTO<br>41|
||**4.2.1.2.**DIAGRAMA DE CASOS DE USO<br>41|
||**4.2.1.3.**DIAGRAMA DE ACTIVIDADES<br>43|
||**4.2.1.4.**DIAGRAMA DE SECUENCIA<br>45|
||**4.2.1.5.**DIAGRAMA DE CLASES<br>47|
||**4.2.1.6.**DIAGRAMA DE COMPONENTES<br>47|
||**4.2.1.7.**DIAGRAMA DE ENTIDAD RELACIÓN<br>48|
||**4.3.**<br>DISEÑO DEL SOFTWARE<br>49|
||**4.3.1.**PÁGINA PRINCIPAL<br>49|
||**4.3.2.**<br>PÁGINAS DE AUTENTICACIÓN DE USUARIOS<br>50|
||**4.3.3.**<br>PÁGINA DE GENERACIÓN DE ATUENDO<br>50|
||**4.3.4.**<br>PÁGINA DE GUARDARROPA<br>51|
||**4.4.**<br>CONSTRUCCIÓN DEL SOFTWARE<br>52|
||**4.5.**<br>PRUEBAS DE SOFTWARE<br>56|
|**5.**|REPOSITORIO PRODUCTO SOFTWARE<br>59|
||CONCLUSIONES<br>59|
||RECOMENDACIONES<br>59|
||BIBLIOGRAFÍA<br>60|



3 

## **Introducción** 

Existen múltiples factores que pueden influir en la percepción que tiene la sociedad sobre un individuo, estos factores pueden incluso afectar el como la misma persona se percibe a sí mismo, uno de estos factores es la apariencia, la gente puede estar predispuesta a 

determinados comportamientos y suposiciones basándose en la forma en que se presentan aquellos con los que interactúan, y una parte importante de la apariencia es la vestimenta, sin embargo, crear atuendos y combinar prendas de forma consciente puede ser un proceso que puede tomar tiempo, además de requerir determinados conocimientos en conceptos que no todo el mundo tiene tiempo o voluntad de aprender, como pueden ser combinación de colores, patrones, estilos, o el contexto apropiado para determinados estilos, crear atuendos para cada día y ocasión se puede convertir entonces en un proceso tedioso y complicado, adicionalmente, podemos mencionar que las personas no aprovechan por completo la ropa que poseen lo que provoca que la desechen y remplacen por nueva que muy probablemente tampoco 

aprovechen, esto genera una gran cantidad de desperdicio cada año, si las personas supieran como combinar su ropa, podrían aprovecharla mejor, realizando distintas combinaciones con la misma, sin necesidad de remplazarla. 

Por estos motivos proponemos una aplicación que implementará un algoritmo para la creación y recomendación de outfits o combinaciones de ropa, tomando información básica del usuario, como puede ser el clima y el contexto y usando ropa registrada por el usuario creará un atuendo de acuerdo a las especificaciones, teniendo en cuenta los conceptos mencionados con anterioridad como la teoría de colores, o los atuendos según el clima, para generar un outfit que se vea bien y se acople al contexto provisto por el usuario, en este documento se expondrán los detalles respecto a esta idea, explicando en mayor detalle las motivaciones, objetivos, posibles obstáculos y limitaciones, herramientas necesarias, procedimientos necesarios y actividades a realizar, todo esto con el objetivo de justificar el proyecto y tener una visión más clara del porque se realiza el proyecto y el como se planea lograrlo, identificando 

4 

alcance y objetivos para nuestro sistema, así como planear las acciones necesarias y el tiempo 

estimado de desarrollo. 

## **1.** Problema de la investigación 

Elegir un atuendo cada día para cada ocasión puede ser una actividad que toma tiempo, a la vez que puede resultar agobiante para algunas personas que invierten una gran cantidad de tiempo y esfuerzo decidiendo que van a ponerse. 

## **1.1.** Objeto o tema de Investigación 

El proyecto presentado se enfoca en proponer un sistema de software que 

brinde asistencia al momento de determinar que tipo de atuendo utilizará una persona, para esto se utilizará tanto información dada por el usuario como determinadas reglas 

de moda 

## **1.2.** Área de Investigación 

Este proyecto se enmarca en el área de investigación del 'Desarrollo de Software' enfocándose en la utilidad de sistemas de software para la simplificación y automatización de actividades cotidianas o repetitivas a través de algoritmos, el objetivo siendo desarrollar una aplicación de software que ayude a los usuarios en el proceso de selección de un atuendo utilizando su propia ropa, esta área implica el desarrollo de software, implementando algoritmos y herramientas de machine learning 

## **1.3.** Línea de Investigación 

Dentro del área de desarrollo de software, la línea de investigación específica 

que guía este proyecto es el ‘Desarrollo de aplicaciones web’ Integrando algoritmos, 

sistemas de base de datos, backend, y la incorporación de herramientas existentes de machine learning, integrándose con el propósito desarrollar soluciones utilizando software para satisfacer necesidades relacionadas a la elección de atuendo. 

## **1.4.** Planteamiento del Problema 

5 

Para muchas personas puede ser complicado elegir qué prendas utilizar en el día a día, muchos no tienen tiempo o no saben cómo combinar sus prendas, esto no parece un problema significativa, hasta que entendemos que, no prestar atención a las prendas que se utilizan puede llevar a que no se aprovechen la mayoría de estas, lo que puede llevar a que se desechen prendas debido a no saber cómo combinarlas o directamente por haberse olvidado de las mismas, esto es problemático debido a que genera desperdicio con un impacto ambiental significativo, no solo porque se desechan prendas, sino que también porque muchas personas desechan prendas y consiguen otras, lo que aumenta la demanda y por tanto la producción masiva de prendas y todo el impacto ambiental que esto conlleva 

## **1.5.** Formulación del Problema 

La elección de un atuendo es una parte fundamental de la presentación de una persona debido a los efectos que puede provocar en la percepción de aquellos que rodean al individuo, pues no solo se trata de utilizar determinadas piezas de ropa, sino también de saber que piezas encajan mejor con cada persona, un artículo del diario Sage, llamado “La vestimenta es un componente fundamental de la percepción de la persona” lo explica de la siguiente manera “El impacto de una determinada prenda de vestir en las percepciones de cualquier individuo no puede entenderse en el vacío: el mismo par de jeans podría provocar impresiones tremendamente diferentes dependiendo de con qué se use, quién lo use (su rostro y tipo de cuerpo), dónde lo use y cuándo (la estación, el siglo)” (Hester & Hehman, 2023) existen distintos factores que pueden afectar la percepción de un individuo o un colectivo hacia un atuendo, el artículo mencionado previamente describe cuatro factores, categorías sociales, estados cognitivos, estatus y estética, la vestimenta no afecta solo a la percepción externa, sino qué, según un estudio diferente, puede afectar a la percepción interna del individuo e incluso su comportamiento, describiendo distintos experimentos donde a los sujetos se 

6 

le hizo elegir determinados atuendos o utilizar distintos artículos de ropa, y luego realizar determinadas tareas, y en algunos casos evaluar su propio desempeño, el desempeño o comportamiento durante las tareas cambiaba entre sujetos que usaban o no usaban distintos artículos, de igual forma también parecía influir en la auto 

evaluación que se asignaban tras la realización, así como una auto percepción negativa de si mismos al utilizar atuendos que se percibieran inadecuados para determinados escenarios como puede ser vestirse de forma casual en un entorno laboral (Johnson et al., 2014), teniendo esto en cuenta, podemos observar la importancia que puede tener la ropa que utilizamos y el contexto en la percepción tanto externa como interna, por lo que no sorprende que algunas personas tengan muy en cuenta esta parte de su rutina diaria, un estudio realizado por la empresa británica de venta de ropa y productos de belleza, Marks & Spencer, afirmó que algunas mujeres podría tomarles hasta 17 minutos decidir que utilizar, mientras que a algunos hombres les podría tomar hasta 13 minutos, este tiempo podría no parecer demasiado, hasta que nos damos cuenta que, acumulativamente, se podrían traducir en cuatro días por año para las mujeres y tres días por año para los hombres, solo eligiendo que utilizar, adicionalmente, según la encuesta realizada por la empresa, 62% de mujeres llegan a sentir frustración moderada al no ser capaces de decidir que utilizar, situación que también se presentó a un tercio de la población masculina encuestada (Cliff, 2016) sin embargo, la importancia de ser consciente respecto a lo que vestimos y sacarle provecho al guardarropa no se reduce solo a la percepción o la inversión de tiempo, sino que también se puede percibir en el impacto ambiental de la moda. 

Existe una tendencia conocida como fast fashion, consistente en la producción masiva y acelerada de prendas con el propósito de seguir tendencias en constante cambio, debido al cambio rápido de las tendencias y el deseo de seguirlas, este tipo de ropa suele utilizarse por poco tiempo antes de cambiarse por otras prendas, esto 

7 

provoca el desperdicio al desecharse prendas a un ritmo casi tan acelerado como el cambio de las tendencias. 

Según estudios registrados en un artículo para earth.org una organización ambiental, se estima que cada año se generan alrededor de 92 millones de toneladas 

de desperdicio textil además, de que el americano promedio desecha 81 libras y medio de ropa cada año y que la gente cada vez usa la misma ropa menos veces, por no mencionar lo costosa que es la producción, requiriendo veinte mil litros de agua para producir un kilo de algodón, entre otros efectos problemáticos para el ambiente que el artículo menciona (Igini, 2024), esta situación llama a que los consumidores sean más conscientes de la ropa que compran y traten de sacarle mayor provecho a su guardarropa antes de desecharlo. 

## **1.6.** Objetivos de la investigación 

## **1.6.1.** Objetivo General 

Desarrollar una aplicación de software que facilite y automatice el proceso de selección de atuendos según necesidades específicas, mediante un algoritmo que genere una combinación de ropa apropiada acorde a un marco establecido y las especificaciones del usuario. 

## **1.6.2.** Objetivos Específicos 

- Definir requisitos funcionales y de calidad para el sistema, permitiendo un análisis a nivel de la capa de negocio, aplicación, y tecnologías que atienden la 

definición de características deseables. 

- Diseñar las funciones, interfaces y arquitectura que permitirán a los usuarios la generación de atuendos en atención a los requisitos funcionales y no funcionales ya planteados. 

8 

- Construir un sistema que cumpla con los requisitos establecidos, generando 

salidas en forma de atuendos que cumplen con los estándares definidos y que 

se acoplan a las solicitudes de los usuarios 

- Probar y validar el prototipo del sistema, verificando que las funciones 

implementadas cumplen con los requisitos funcionales y no funcionales, así 

como con los estándares de moda previamente definidos. 

- Presentar el prototipo desarrollado, incluyendo el diseño, funcionamiento y 

resultados obtenidos, para su evaluación y posibles mejoras futuras 

## **1.7.** Justificación 

A través de lo anteriormente descrito hemos podido identificar que una cantidad 

de personas, tiene dificultades para elegir atuendos, ya sea porque no tienen tiempo, o porque no saben cómo combinar sus prendas, esto pasa a ser un problema de mayor magnitud cuando se entiende que al no poder o no saber aprovechar su guardarropa muchas personas tienden a desechar una gran parte de sus prendas, lo que 

desencadena en un conflicto ambiental debido a la contaminación que se produce 

durante la fabricación de prendas que se demandan debido a la frecuencia con la que se desechan y la que se contaminación producida debido a la cantidad de ropa que se desperdicia, nuestra aplicación busca entonces permitir que los usuarios puedan dar un mejor aprovechamiento al dar ideas de combinaciones con prendas que el usuario podría haber olvidado que tenía o que podría no usar debido a no saber cómo combinarla con otras. 

De igual forma, y como se profundizará más adelante, se han identificado 

algunas aplicaciones con funcionalidades similares, desde aplicaciones que permiten formar outfits hasta una que permitía la generación de atuendos, sin embargo, las aplicaciones de creación de outfits o de guardarropa como SmartCloset, YourCloset, 

9 

requieren que el usuario forme sus outfits manualmente, mientras que aplicaciones como Outfit Helper, que sugiere combinaciones de ropa, pueden ser difíciles de utilizar por requerir demasiadas entradas por parte del usuario y no contar con una interfaz gráfica más allá del chat, además de no contar con un guardarropa, la solución 

planteada busca permitir la generación automatizada de atuendos utilizando ropa del usuario a través de entradas básicas como contexto de uso y color, esto para permitir que el usuario genere un atuendo que, aproveche las prendas de su guardarropa y se acople a la situación. 

Se identificó la existencia de un problema y oportunidades de mejora respecto a alternativas ya existentes, con esto es posible describir por qué existe el sistema planteado, ahora resulta importante definir el para qué. 

El sistema busca agilizar el proceso de creación de atuendos utilizando prendas del usuario, permitiendo el registro de prendas y la generación automatizada de atuendos utilizando estas prendas siguiendo determinados parámetros, esto para ayudar a realizar un mejor aprovechamiento de las prendas que el usuario posee a través de recomendaciones que brinden ideas para combinar prendas que el usuario podría no haber considerado previamente. 

Se busca además permitir que el usuario lleve un registro de sus prendas a través del guardarropa virtual, ayudando en la organización de su ropa, para que las personas que utilicen el sistema sean capaces de llevar un inventario y aprovecharlo. 

## **1.8.** Delimitación 

El proyecto se centrará en la creación de un prototipo operativo de una aplicación en web, que podrá incorporarse como extensión en sitios web de marcas de moda. El objetivo principal será la creación de conjuntos de ropa a partir de prendas propias, considerando únicamente reglas elementales de combinación de colores y, opcionalmente, el contexto de uso (formal, casual, etc.). No se contemplarán elementos 

10 

sofisticados como recomendaciones profundamente personalizadas, algoritmos de 

inteligencia artificial, ni implementación en producción, ya que el alcance se enfoca en la demostración conceptual y funcional a través de un prototipo navegable. 

## **2.** Marco Teórico 

## **2.1.** Antecedentes 

Vestirse es una necesidad básica del ser humano, así como la necesidad de encajar en el entorno y en un contexto, por esto, no resulta extraño que existan múltiples propuestas que buscan facilitar está actividad, las siguientes propuestas destacaron de forma significativa para nosotros. 

Outfit Helper 

Un sistema planteado por Zhang and Wang (2019) que utiliza algoritmos de Dialogflow con funcionalidades de Natural Language Processing (NLP), el sistema consiste en un asistente conversacional, esto significa que los usuarios interactúan con el sistema a través de diálogo, el agente conversacional usa ManyChat para el manejo de la estructura de las conversaciones y usa Integromat para la interacción con servicios de terceros, la aplicación usa Azure Computer Vision para poder detectar los colores de la ropa del usuario a través de una fotografía y utiliza la teoría del color para analizar la compatibilidad de los colores, en materia de funcionamiento, la aplicación es un chatbot, básicamente, que pregunta al usuario respecto al lugar al que se dirige, posteriormente, pregunta al usuario si quiere consejo sobre estilo, color, ambos o ninguno en especifico (No idea), si el usuario escoge estilo, deberá introducir el estilo de ropa que planea usar (ej. Camiseta de manga larga y jeans) y el chatbot le dirá si el atuendo es apropiado, escoger color, provocará que el chatbot solicité una fotografía del atuendo para verificar los colores y si la combinación es apropiada, en caso de que el atuendo se considere inapropiado, el sistema le suministrará al usuario consejos en texto o incluso imágenes, 

11 

finalmente si el usuario escribe que no tiene idea, el chatbot preguntará por el tipo de ropa que prefiere y el color que le gusta y dará sugerencias con base en la información Outfit Selection Using Colour Matching Application And Image Processing Rebello et al. (2020) diseñaron una aplicación móvil que permitía a los usuarios la adición de prendas a una base de datos a través de imágenes usando un algoritmo conocido como Grab Cut para la eliminación del fondo, estas prendas podrán ser utilizadas posteriormente por el usuario en una interfaz diseñada en Unity para simular combinaciones a través de un modelo digital, dicho modelo tiene opciones como cambio de color, finalmente la aplicación cuenta con funciones para compartir el modelo con la ropa seleccionada, el flujo básico sería el siguiente, el usuario utiliza una imagen o fotografía en la aplicación y selecciona la prenda, el algoritmo Grab Cut extrae la prenda de la imagen y la añade a la base de datos, posteriormente el usuario puede seleccionar la prenda y arrastrarla hacia el modelo para observar como se combinaría con el resto de prendas. 

Smart Closet 

“The concept of an intelligent system of an outfit completion” es un artículo escrito por Semianchuk and Shestakevych (2020) que describe múltiples soluciones que buscan facilitar el proceso de seleccionar un outfit, una de ellas es Smart Closet, una aplicación móvil para seleccionar ropa online, permite crear una imagen y escoger artículos de distintas marcas y almacenarlas en un guardarropa virtual, al mismo tiempo también se pueden agregar piezas de ropa desde fotografías tomadas desde el teléfono, y organizarlas añadiendo información adicional como precio o temporada Your Closet – Smart Fashion 

Desde el mismo artículo descrito con anterioridad, se menciona una aplicación que ayuda a organizar un guardarropa, crear atuendos, planear con un calendario, 

12 

selección por color, contiene también una tienda online en la que se pueden buscar artículos de ropa de interés e incluso realiza recomendaciones según los artículos del guardarropa. 

Ecochildclo 

Una aplicación móvil diseñada por Jalil, Shanat y Moghadasi (2022) orientada al diseño de patrones de ropa para niños, es decir, que el usuario ingresaría determinada información relevante sobre el niño y el tipo de ropa requerido y el sistema retornaría un PDF con el patrón para su impresión, el proceso de uso sería el siguiente, el usuario selecciona el tipo de vestimenta que necesita en una interfaz creada a través de Adobe Illustrator, tras seleccionar, al usuario se le mostrarán distintos estilos del tipo de prenda mostrados de frente y espalda, el usuario selecciona uno, posteriormente se le permitirá al usuario la personalización de las prendas introduciendo las medidas del infante y el tamaño del área de costura, finalmente, el usuario podrá presionar el botón de “imprimir” para poder obtener el diseño. 

Brecha Identificada 

Teniendo en cuenta las diferentes aplicaciones mencionadas con anterioridad, el equipo llegó a la conclusión de que no existe una aplicación móvil para Android que se enfoque en la asistencia de los usuarios en la creación de outfits utilizando ropa de la que el usuario disponga a través de un guardarropa digital, y usando parámetros como el contexto, patrones, estilo de ropa e incluso algunos que puedan definir el estilo personal del usuario, como pueden ser preferencias de color o el tipo de ropa que prefiera (Ropa casual, elegante, cómoda) o incluso el estado anímico de la persona en el momento dado, teniendo en cuenta además reglas como la colorimetría, o patrones de la ropa, algunas de las soluciones mencionadas no incluyen funcionalidades como el aprendizaje continuo de la aplicación frente al uso frecuente del usuario o la generación de atuendos utilizando ropa subida por el propio usuario a un guardarropa virtual. 

13 

A través de la programación orientada, una estructura por capas así como visión de máquina, se planea crear un sistema que incorpore un algoritmo de optimización combinatoria que permite la generación de outfits según su color y estilo, siguiendo los principios de teoría del color, ofreciendo una funcionalidad nueva con respecto a alternativas, como puede ser la capacidad de generar outfits dependiendo de una ocasión definida por el usuario. 

## **2.2.** Teorías Generales del Proyecto 

El proyecto que se presentará a continuación consiste en un sistema web que, a través de un algoritmo de combinación permitirá la creación de un atuendo, para asegurar la comprensión respecto al proyecto y proveer de un contexto es necesario definir algunos términos y conceptos que serán prominentes a través del documento. 

Moda 

Primero resulta de vital importancia el entender a qué se hace referencia al hablar de moda, pues, el sistema planteado se basa en conceptos relacionados fuertemente a este término, la palabra Moda viene del latín modus que hace referencia a modo, en inglés la palabra para moda es Fashion que viene del latín facere, que significa hacer, desde aquí podemos definir que la moda o fashion hacen referencia a la forma de hacer algo, en un contexto actual estas palabras significan según diccionarios como el de oxford, la forma de hacer algo que se considera actual o popular, en el contexto del vestuario, sería entonces el modo de vestirse culturalmente aceptado como popular (Breward, 2019). 

Principio de estilo y moda 

La moda ha sido históricamente entendida como un fenómeno social, estético y cultural que refleja aspiraciones y valores de una sociedad en ciertas circunstancias y momentos específicos que atraviesa el mundo. Este fenómeno, va mucho más allá que la misma vestimenta, en cambio, constituye un lenguaje no verbal, que funciona como 

14 

un medio en el cual los individuos pueden expresar su identidad, funciona como un sentido de pertenencia ya que como afirma Silvia Eugenia “La moda se da cuando el individuo pertenece a un grupo y, como parte de esta relación, se erige con dos principios fundamentales: la adaptación al grupo social al que se pertenece y el ascenso del individuo por fuera del grupo.” (Niño, 2023, p. 24). Esta afirmación permite comprender cómo es que la moda opera bajo una tensión constante presentada como dualidad refiriéndose a lo colectivo e individual, la constante necesidad de integrarse a un grupo social y, al mismo tiempo, tener la aspiración de diferenciarse mediante un estilo y personalidad propia. 

Entonces, no tan solamente responde a un fenómeno como un todo, a una parte colectiva, sino que encuentra un lugar en estilo de cada persona en un campo de expresión individual que trasciende tendencias y temporalidades del mundo. Mientras que la moda sigue en un cambio constante, apegándose a parámetros como la industria y contextos sociales, por el otro lado, el estilo no apunta más allá que una construcción estable que se liga al sentido de pertenencia y autenticidad de la persona. Como nos menciona Patricia Doria “El estilo pasa a ser la forma de individualización dentro de la tiranía de la moda; es una forma de mostrarse distinto ante los demás y por lo tanto identificándose como un ser único y especial.” (Doria, 2012, p. 103). 

Esta perspectiva resalta que el estilo no responde a influencias y tendencias, sino que es un recurso de autoconocimiento y auto expresión, es un modo por el cual se consolida una identidad por medio de la moda. 

Este vínculo entre moda y estilo abre un paso a los principios básicos que guían la construcción de un atuendo, donde, factores como la armonía del color, proporciones de las prendas y una coherencia con el contexto donde este atuendo se usará, son clave para cumplir con esta práctica de autoexpresión y comunicación no verbal “El estilo promete eternidad, y atemporalidad” (Doria, 2012, p. 102). 

15 

El concepto de la moda como autoexpresión es importante para el desarrollo de una aplicación que entienda la importancia que tiene en muchas personas el llevar un atuendo que refleje y comunique su identidad, por esto, el equipo enfatiza en aplicar principios de la moda fundamentales para crear un algoritmo que entienda al usuario en este proceso de crear un atuendo. 

Teoría del Color 

Una de las reglas fundamentales, no solo en la moda, sino en el arte en general es el concepto de la teoría del color, un conjunto de teorías que buscan explicar la percepción del color en humanos, Albert Henry Munsell un profesor de arte, desarrolló un método para identificar los colores a través del tono, valor y el croma a través del cual se puede especificar colores a través de códigos numéricos definidos según los valores de cada tono se acerquen entre sí (Agoston, 1987). 

Adicionalmente, existe un método aceptado internacionalmente por la CIE (Comisión Internacional d’Eclairage) donde se especifica el color basándose en la cantidad relativa de los tres colores primarios que se mezclan para obtenerlo, a través de la organización de colores propuesta por Wilhelm Ostwald donde se relacionaban a través de la medida de la luz, se terminaría definiendo un manual de armonía del color (Agoston, 1987), donde se dividían y organizaban los colores según sean cromáticos (Cuyos tonos se pueden cambiar a través de la aplicación de los colores primarios rojo, azul o verde) y acromáticos (Jacobson, 1946) 

La parte de la teoría del color que se enfoca en la armonía al momento de combinar colores se basa fuertemente en los sistemas de organización de colores, la descripción de los anteriores conceptos permite entender el origen de la organización de los colores y el por qué, brindando una mayor comprensión respecto a las bases en que se apoyan las reglas que utilizará el algoritmo para la toma de decisiones. 

16 

En las teorías del color se utilizan los sistemas de organización para identificar combinaciones armónicas, esto se puede realizar a través de determinados ángulos en el circulo cromático que permiten identificar combinaciones de colores armoniosas, las más comunes son: los colores complementarios, donde se forma una linea recta entre dos colores del círculo para determinar que color puede complementar mejor a otro, este color será entonces el que se encuentre al lado opuesto, los colores split complementarios, donde se usan los colores adyacentes al complementario del color, existen también las triadas de colores, donde se utilizan los tres colores que se 

encuentran al trazar un triangulo equilatero en el círculo cromático, en otras palabras los colores que se encuentran en angulos de 30 grados a la izquierda y 30 grados a la derecha respecto a otro color, otras combinaciones armoniosas se pueden hallar al trazar un cuadrado o un rectangulo en el círculo cromático, en estas se establecen cuatro colores que generan una combinación armoniosa, en el caso del cuadrado los colores se ubican a 45 grados a la izquierda o derecha los unos de los otros, finalmente tenemos los colores análogos, que básicamente es combinar tonalidades diferentes de un mismo color, es decir, utilizar colores adyacentes al seleccionado. (Dodgson, N. 2019) 

La importancia de este concepto radica en que son estas teorías las que definirán las reglas que rigen el comportamiento del algoritmo, y las que sustentan la validez de sus decisiones, permitiendo al equipo de desarrollo apoyarse de reglas definidas en el sector de la moda para poder programar el algoritmo y evaluar sus resultados 

Mezcla de patrones 

La regla general en la moda cuando se trata de patrones es utilizar una prenda con patrones y otra plana, esto permite que la atención se enfoque en la prenda con el patrón y evita que las demás piezas compitan por la atención, sin embargo también es 

17 

posible formar un atuendo mezclando patrones, pero resulta importante que los patrones tengan al menos un color que coincida, también es importante que un patrón sea central, por lo que se recomienda usar uno grande y uno pequeño para evitar sobresaturación. (Abby, 2023) 

Esto resulta importante debido a que es otra de las reglas que se utilizarán para formar los atuendos en el generador y validar las decisiones del sistema 

Mezcla de materiales 

A la hora de crear un atuendo también se pueden tener en cuenta los materiales, cuando se trata de texturas de las prendas se pueden tomar múltiples caminos, ya sea combinando prendas con el mismo material y el mismo color para prevenir 

sobresaturación, o mezclar materiales balanceando los pesos entre los artículos, existen texturas más “pesadas” como el cuero o la lana, y otras más “ligeras” como la seda o el algodón, se buscaría en el atuendo combinar texturas pesadas con otras más ligeras para que exista una prenda que funcione como foco. (López. C, 2024) 

Algoritmos de Optimización Combinatoria 

La optimización se puede entender como la búsqueda de los máximos y mínimos de las funciones, pero encontrar el punto óptimo puede ser complicado, por la cantidad de posibilidades, producto de la cantidad de restricciones o complejidad de la función, para hallar las soluciones óptimas, podemos utilizar algoritmos para llegar a resultados aproximados, estos algoritmos suelen requerir el establecimiento de límites que definan si el resultado es apropiado, esto se suele hacer relajando las restricciones, a estos algoritmos se les conoce como dual heurísticos, donde se simplifica el problema al reducir o remover restricciones, lo que permite que el problema sea más sencillo de resolver y nos acerca a una solución óptima, entonces podemos comprender que un algoritmo de optimización combinatoria, se trata de un conjunto de instrucciones que buscan la mejor solución posible a un problema, es decir, la más óptima a partir de la 

18 

reducción de alternativas a un conjunto finito, a través de métodos heurísticos (Investigación no rigurosa basado en métodos empíricos) para minimizar o maximizar una función de evaluación. (Grotschel, M., & Lovász, L. 1995). 

Este concepto resulta de gran importancia debido a que el sistema planteado requiere de un algoritmo que sea capaz de decidir cuál es la mejor opción para un problema bajo determinadas reglas o restricciones, más especificamente, según el color, el contexto y de aplicar, la prenda del atuendo, definir que prenda sería más apropiada para finalmente formar un atuendo, este tipo de algoritmo, es ideal para el sistema pues permitiría dar resultados que se aproximen a la mejor decisión de vestuario 

Introducción al contexto de uso 

El proceso de escoger un atuendo no puede analizarse de manera aislada, pues de alguna manera, una condición en juego es el contexto de uso. Es decir, ya sea por el espacio social, situacional o cultural en el que se puede desarrollar la interacción con el atuendo. En varias ocasiones los autores afirman que la indumentaria opera como un código que comunica y se adapta según el entorno. Esta indumentaria se inscribe dentro de la comunicación no verbal, donde cada elección transmite información sobre la identidad, así como también, del rol social de cada individuo. Como lo señalan Migueles y Gordillo (2014) 

En toda interacción humana intervienen flujos de señales no verbales que, en un proceso de codificación y decodificación, se mueven de un interlocutor a otro. […] todo comportamiento humano, incluso el silencio y la inmovilidad, es siempre un vehículo informativo en el contexto de la interacción personal (p. 2). 

Eso abre a una comprensión de como la vestimenta no solo cumple una función estética, sino también comunicativa. El atuendo actúa como medio por el cual los 

19 

individuos pueden transmitir pertenencia, profesionalismo, rebeldía o en algunos casos neutralidad. En consecuencia, el contexto de uso determina que mensajes se transmiten y cuales son adecuados verdaderamente en una situación concreta. 

En los contextos formales, la ropa suele estar ajustada a códigos de etiqueta, los cuales buscan una proyección de respeto y seriedad, estos contextos de 

profesionalismo han cambiado con el tiempo, antes el diario vivir y situaciones del día a día se apegaban a estas proyecciones, pero hoy en día lo vemos estipulado en momentos concretos. Tal y como lo afirma Valencia Vaca y Guerra Hernández “Hay un equilibrio delicado entre mantener las tradiciones y permitir que evolucione el dress code para adaptarse a los tiempos modernos y a las necesidades cambiantes de la comunidad” (Valencia Vaca & Guerra Hernández, 2023, p. 12). 

Esto refuerza esa idea de que la moda y el dress code no son elementos estáticos, el algoritmo generador de la aplicación web debe tener en cuenta esto, para mantener estas líneas separadas, es importante el contexto de uso, la aplicación busca adaptarse a nuevas exigencias de la sociedad contemporánea. Como se describe en la cita, es el equilibrio delicado el que se debe asegurar, ajustándose a demandas de contextos específicos, como el ámbito laboral o académico, manteniendo coherencia en los atuendos para específicas ocasiones. 

El contexto digital y contemporáneo 

En la actualidad, el contexto de uso se transporta no solamente a un espacio físico, sino que trasciende y se expande a un entorno digital. Podemos observar cómo plataformas como Instagram han redefinido el panorama y la manera en que las personas idealizan la creación de sus atuendos. Siguiendo esta línea, vestir ya no solamente responde a un evento presencial, ahora, también proyecta una imagen “curada” en espacios virtuales. 

20 

En este contexto digital contemporáneo, la moda circula en plataformas de redes sociales, donde los usuarios consumen, pero también crean, validan y transforman significados asociados a la vestimenta y la identidad. Como lo afirma Domingo Martínez (2013) 

En la era de las redes sociales, dónde el consumidor es el rey indiscutible, las marcas deben conocer cómo los consumidores utilizan los múltiples dispositivos y plataformas para comunicarse si desean conectar con ellos. Marcas del sector de la moda y de estilos de vida ven el entorno digital como una oportunidad clave para desarrollar su estrategia de marketing (p. 1). 

Lo anterior propone que la moda se proyecta en redes sociales y que la gestión digital es una estrategia establecida más no es opcional, la moda se adapta a través de las generaciones “El sector de la moda también ha modificado sus formas de acceder a un público cada vez más masivo, complejo y exigente” (Martínez, 2013, p. 5). Esto quiere decir, que la moda se ha transformado en un sector económico relevante para nuestra comunidad, ha evolucionado globalmente gracias a las redes sociales jugando un papel mucho más grande que llega a cualquier parte del mundo. 

En este panorama, la aplicación web propuesta se inserta como respuesta a la necesidad de articular la moda con las dinámicas digitales actuales. Si las redes sociales se presentan como un espacio digital que comparte y valida la vestimenta, se genera la necesidad de un medio por el cual los usuarios consuman tendencias y participen en la construcción de su identidad a través de la moda de manera digital. Visión de Máquina 

El proceso de detección y reconocimiento de objetos, también conocido como visión de máquina, puede definirse como el proceso donde las máquinas procesan las imágenes y son capaces de reportar lo que se encuentra en la imágen, reconociendo el contenido de la imágen, usualmente enfocándose en partes maquinadas que se le ha 

21 

programado no solo para encontrar sino que para inspeccionar (Snyder, W. E., & Qi, H. 2004). 

Este concepto resulta de gran importancia para el proyecto debido a que la funcionalidad del sistema gira en torno a la capacidad del mismo para detectar y 

clasificar ropa, para luego usar dicha clasificación para la creación del atuendo, para esto se utilizará Machine Vision para lograr que el sistema encuentre la ropa en una imágen, y la describa haciendo énfasis en el color y el estilo, las dos características alrededor de las que girará la generación de atuendos 

CLIP (Machine Learning) 

Las siglas de CLIP significan Contrastive Language Image Pretraining, se trata de modelos de AI desarrollados por OpenAI que busca entender y relacionar 

descripciones en texto e imágenes, usando entrenamientos que contrastan pares de imágenes y texto, buscando si un texto encaja con una imágen o no, realizando un tipo de aprendizaje llamado Zero Shot Learning, el sistema compara y contrasta textos e imágenes, ajustando pesos y detectando incompatibilidades, gracias a esto, una vez entrenado, puede clasificar imágenes en cualquier categoría sin necesitar que se le haya entrenado explícitamente en dicha categoría (Hugging Face, 2021) 

Esto es relevante para el proyecto presente debido a que el sistema utiliza el modelo pre entrenado Fashion CLIP para la detección de características de prendas como material, patrón, tipo, etc. Este modelo es de tipo CLIP y utiliza Zero Shot, por lo que es importante introducir estos conceptos. 

Filtrado basado en contenido 

El filtrado basado en contenido analiza las características de diferentes ítems ya sean artículos, documentos, productos, entre otros. Y se encarga de comparar un perfil de usuario para finalmente decidir que opción es viable recomendar. Como lo reafirma Pacheco Pazmiño (2018) 

22 

Un sistema de filtrado basado en el contenido selecciona elementos basados en la correlación entre contenido de los artículos y las preferencias del usuario en comparación con un filtro colaborativo sistema que elige elementos basados en la correlación entre personas con preferencias (p. 4). 

Aquí el autor subraya que este tipo de filtrado no depende de otros usuarios, tiene en cuenta únicamente el contenido que una persona consume, esta 

individualización lleva a que muchas plataformas generen personalización en cada usuario, teniendo un efecto positivo en el contenido que consumen las personas en internet a pesar de la sobrecarga informativa y “ruido” de este mismo. 

Estos sistemas de filtrado basados en contenido suponen un reto extra a la hora de usarlos contra usuarios reales que consumen una aplicación y buscan tener 

recomendaciones apegadas a sus gustos y expectativas, de esta manera, hay fatores claves que determinan la efectividad de estos sistemas. “Una de las variables importantes es el volumen de la información, ya que de éste depende el detalle de las recomendaciones...” (Balavanovic & Shoham, 2016, como se citó en Pazmiño, 2018, p. 8). Esto nos indica que estos sistemas no solo dependen de un algoritmo bien estructurado y funcional, sino también de la cantidad y calidad de los datos disponibles. Un volumen de información muy bajo tiene un impacto negativo en las recomendaciones tornándose limitadas, mientras que grandes volúmenes de datos pueden generar “ruido” teniendo que usar técnicas de limpieza de datos y selección de los mismos para su uso en el sistema de recomendación. 

Existen diferentes enfoques en los sistemas de filtrado basados en contenido, que buscan responder a necesidades de reducir cargas gigantes de información a las que los usuarios se enfrentan actualmente en internet. Uno de estos que ha cobrado gran relevancia es el filtrado basado en contenido del usuario, el cual centra su lógica 

23 

en los atributos de los ítems y en las interacciones previas del usuario con estos mismos ítems o datos. En este sentido, se afirma que: 

Los sistemas de filtrado basados en el contenido donde el contenido desempeña un papel principal en el proceso de recomendación, en el que las calificaciones de los usuarios y las descripciones de los atributos de los elementos se aprovechan para hacer predicciones (Medrano, 2018, p. 24). 

Esta definición permite entender que el filtrado basado en contenido del usuario tiene fundamentación en la relación directa entre los intereses del usuario y las características de los elementos disponibles. Se diferencia del filtrado colaborativo, que depende de similitudes entre diversos usuarios, este enfoque trabaja en un perfil de usuario individual que funciona en base a sus gustos y preferencias. 

En relación con el proyecto, el filtrado basado en contenido se presenta como una estrategia que es clave para ofrecer a cada usuario recomendaciones personalizadas en función de sus propias interacciones dentro de la plataforma. Nuestro sistema busca conectar moda y experiencia digital, este tipo de filtrado facilita al 

algoritmo generador buscar atuendos, estilos o combinaciones que sean acordes a los gustos del usuarios sin depender de elecciones de otros usuarios. 

La aplicación fortalece la construcción de una identidad, la integración del filtrado basado en contenido optimiza la usabilidad de la aplicación, aportando valor significativo en transformar grandes volúmenes de datos en una experiencia digital personalizada, respondiendo a expectativas actuales del consumidor. 

## HTML 

Para el desarrollo del sistema, se utilizarán los lenguajes correspondientes al desarrollo web, HTML o Hypertext Markup Language es el lenguaje que se utiliza para la escritura de páginas web permitiendo el añadir texto con formato, añadir gráficos, video, sonido, todo guardado en un archivo legible para navegadores, utiliza etiquetas 

24 

para la creación de elementos dentro de la página web, se basa en dos conceptos, hipertexto y universalidad, el primero hace referencia a enlaces que se pueden crear y que dirigen a la página web, de igual forma estos enlaces se pueden insertar en una página web para llevar a otras páginas en el internet, el segundo concepto, hace referencia a que al tratarse de archivos de texto, en teoría cualquier computadora los puede leer. (Raggett, D., Le Hors, A., & Jacobs, I. 1997) 

HTML es necesario para poder definir los elementos que tendrá la página web en el frontend, darles una estructura y organizarlos, es un lenguaje básico, necesario para la construcción de web Apps y páginas web. 

Typescript 

Javascript fue un lenguaje diseñado en 1995 como un lenguaje de programación que sería fácil de usar para navegadores web, se trata de un lenguaje flexible al no contar con tipos estrictos y no limitar la forma en que se estructura el código, lo cual puede ser beneficioso en algunas ocasiones, pero en otras puede provocar confusión o comportamientos inesperados, Typescript puede ser entendido como Javascript con Tipos, creado internamente en 2010 y lanzado en 2012, se trata de un lenguaje de programación que incorpora la sintaxis de Javascript así como la sintaxis específica de Typescript para la definición de tipos, adicionalmente también funge como un verificador de tipos y como un compilador que convierte el código escrito en Typescript a Javascript. (Goldberg, J. 2022) 

Typescript es un lenguaje utilizado por múltiples frameworks que permite definir 

el comportamiento de páginas HTML, permitiendo que las mismas reaccionen a acciones o estímulos realizados por el usuario, typescript permite una escritura más organizada, permitiendo el uso de clases y objetos similares a los de otros lenguajes. 

CSS 

25 

Cascading Style Sheets un lenguaje que permite la transformación de la 

presentación de un documento o de un grupo de documentos, se utiliza para definir un estilo a los elementos visuales de las páginas web, a través de CSS, básicamente se establecen reglas para determinados elementos que definen cómo se mostrarán en el documento. (Grant, K. J. 2024) 

CSS es el lenguaje utilizado para mejorar la presentación visual de una página permitiendo cambiar parámetros para resaltar determinada información y la forma en que se muestra, frameworks como Tailwind hacen uso de elementos de CSS, por lo que su uso resulta vital en el proyecto planteado 

## React 

Se trata de una librería para Javascript desarrollado por Facebook (Actual Meta) para solucionar desafíos que se presentaron al buscar desarrollar interfaces con datasets que cambian con el tiempo, se construyó para mostrar datos en una interfaz de usuario a gran escala que cambian con el tiempo, de esto se puede entender que React es un framework que nos permite crear y interfaces interactivas que reaccionan y cambian. (Gackenheimer, C. 2015) 

React es un framework que permite la creación de interfaces reactivas, 

necesarias para la mayoría de aplicaciones modernas y especialmente para el proyecto presentado, ya que se trata de un sistema que interactúa con el usuario, ya sea en la creación de atuendos o en el registro de prendas, adicionalmente React permite integrar Tailwind, otro framework que será utilizado para el diseño de la interfaz 

Next JS 

Se trata de un Framework de React, que ofrece múltiples características para la creación del frontend de aplicaciones, brindando acceso a múltiples componentes de fácil uso y configuración para la construcción de aplicaciones. (Lazuardy, M. F. S., & Anggraini, D. 2022) 

26 

El equipo seleccionó este framework debido a que permite construir aplicaciones web de forma sencilla y rápida, contando con múltiples componentes listos para usar, así como un sistema de reporte de errores que simplifica la comprensión de los mismos, además de ser un framework compatible con otros como Tailwind 

Tailwind 

Existen dos tipos de frameworks de CSS, el primero centrado en componentes y el segundo en utilidades, Tailwind corresponde al segundo grupo, se trata de un framework para CSS, los frameworks por componentes son fáciles de implementar pero son poco flexibles al trabajar con componentes ya creados, frameworks como Tailwind surgen para solventar esto, ofreciendo funcionalidades de bajo nivel a través de clases que ofrecen más flexibilidad a la hora de diseñar una interfaz, Tailwind es entonces un conjunto de clases de utilidad reutilizables y de bajo nivel que se pueden utilizar para crear cualquier interfaz gráfica, es importante definir que es una clase de utilidad, mientras que un componente es un conjunto de configuraciones de CSS aplicadas de forma opinionada, una clase de utilidad es una propiedad de CSS en específico que podemos usar de forma libre y sencilla dándonos la libertad de combinarlas de la forma que deseemos para crear una interfaz. (Gerchev, I. 2022) 

Base de Datos Relacional 

Se trata de un tipo de base de datos donde la información o datos se almacena y organiza en un sistema tabular, utilizando filas y columnas donde los datos están relacionados entre sí, utiliza llaves primarias y foráneas para la identificación y relacionamiento de datos (IBM, 2025) 

El equipo decidió utilizar la plataforma Appwrite para el manejo de operaciones REST y de base de datos, así como la autenticación, y esta plataforma utiliza sistemas relacionales, específicamente MariaDB, se optó por una base de datos de este estilo 

27 

para mantener una organización de los datos, mantener una mejor integridad de los mismos y debido a que los datos esperados son en su mayoría uniformes. 

## MariaDB 

Una base de datos relacional de código abierto destinada al uso en aplicaciones 

web, es confiable y fácil de usar, desarrollada por antiguos desarrolladores de MySQL como alternativa a dicha base de datos tras la compra de la misma por parte de Sun al encontrarse insatisfechos con el rumbo que tomó MySQL trás la adquisición. (Bartholomew, D. 2012) 

El equipo utilizó MariaDB a través de Appwrite, por tratarse de una base de datos relacional, lo que permite mayor integridad de los datos, así como por ser una base de datos orientada a aplicaciones web y fácil de utilizar 

## Appwrite 

Se trata de una plataforma de desarrollo en la nube, permitiendo el uso de su infraestructura de backend integrada y su hosting web, se trata de una aplicación que facilita el desarrollo de aplicaciones, la creación de bases de datos en la nube y el uso de un sistema de autenticación creado por Appwrite 

Se utilizó Appwrite para poder implementar de forma fácil y rápida el sistema de base de datos en la nube, así como manejar el sistema de autenticación y 

almacenamiento de archivos, Appwrite provee un robusto sistema que facilita las operaciones del backend y el despliegue de aplicaciones. 

## Flask 

Se trata de un framework de Python que permite crear aplicaciones web ligeras en poco tiempo implementando funcionalidades clave y dando al desarrollador la 

libertad de añadir características durante la implementación, se puede usar para Backed o Frontend, permitiendo enrutar endpoints, manejar solicitudes y ofrecer funcionalidades o servicios a través de los endpoints. (Ghimire, D. 2020) 

28 

El equipo decidió utilizar flask debido a ser ligero y simple de implementar, requiriendo solo un archivo de Python para poder desarrollar funciones que se pueden servir a nuestro sistema a través de endpoints, se utilizó para la implementación de visión de máquina y para el manejo del algoritmo de generación de atuendos. 

## OpenCV 

OpenCV es una librería de Python especializada en visión por computadora. Al ser de código abierto y multiplataforma, ofrece herramientas de alto nivel para capturar, procesar y manipular imágenes, sin necesidad, por parte del desarrollador de preocuparse en la gestión del hardware como la cámara o memoria. 

Principalmente, sus capacidades son la captura de video en tiempo real, el procesamiento de imágenes y seguimiento de objetos mediante diferentes dispositivos de captura. 

En el contexto de una aplicación web que genera atuendos, OpenCV será clave para la implementación de funciones relacionadas con el análisis visual de las prendas del usuario. Esto permite identificar diferentes datos como el color, forma o textura de la ropa, siendo clave para generar combinaciones más coherentes según reglas básicas de moda y un contexto de uso. 

## SciKit Learn 

Se trata de una biblioteca de python para de código abierto para el 

entrenamiento de modelos de machine learning, brinda acceso a múltiples algoritmos para la realización de tareas de aprendizaje de máquina, como pueden ser la extracción de características, la creación de modelos predictivos y el clustering, está construida en base a SciPy, Matplotlib y NumPy (Hackeling, G. 2017) 

El equipo optó por esta herramienta debido a que esta librería permite el entrenamiento de modelos de forma sencilla a través de Python, se utilizó para facilitar actividades de visión de máquina necesarias para la identificación del color de prendas 

29 

## Pytorch 

Se trata de una librería de Python que se encarga de ejecutar computaciones dinámicas de tensores o multilineales, básicamente operaciones de machine learning y deep learning como la visión de máquina. (Paszke, A., Gross, S., Massa, F., Lerer, A., 

Bradbury, J., Chanan, G., ... & Chintala, S. 2019) 

El equipo utilizó Pytorch para el manejo de machine vision, específicamente la clasificación por contexto o tipo apoyándose del uso de un modelo pre entrenado que se importa a través de la librería Transformers 

Transformers 

Se trata de una librería dedicada al soporte de arquitecturas transformer, es decir arquitecturas que procesan datos secuenciales en paralelo, además de también permitir y facilitar la distribución de modelos pre entrenados que utilizan este tipo de arquitectura. (Wolf, T., Debut, L., Sanh, V., Chaumond, J., Delangue, C., Moi, A., ... & Rush, A. M. 2019) 

Esta librería fue utilizada para la importación del modelo de machine learning dedicado al reconocimiento de prendas conocido como fashion-clip desarrollado por patrickjohncyh para HuggingFace, que sería utilizado a través de Torch para el reconocimiento e identificación de prendas. 

Programación Orientada a Objetos 

Durante el desarrollo se utilizarán principios y metodologías de desarrollo, principalmente la programación orientada a objetos y la arquitectura por capas, la primera consiste en un estilo de programación que utiliza objetos que se pueden definir como “Colecciones de operaciones que comparten un estado” y están compuestos por las operaciones, que son instrucciones que determinan las respuestas del objeto y variables que representan el estado del objeto, estos componentes determinarán el comportamiento del objeto, este tipo de programación utiliza clases que son 

30 

básicamente una plantilla para la creación de objetos, también llamados instancias, la diferencia radica en que los componentes de las clases son “Potenciales” y no se pueden usar hasta que se instancian, existen otros conceptos como la encapsulación y la herencia, pero lo importante es entender que la programación orientada a objetos, se trata de un método de programación donde se utilizan objetos para el cumplimiento de determinadas funcionalidades y estos se complementan de otros objetos para poder cumplir sus responsabilidades, este tipo de programación permite la especialización (El enfoque de componentes a determinadas funciones) la reutilización del código y la abstracción (Wegner, P. 1990) 

Se planea utilizar este estilo de programación debido a que permite el desarrollo de aplicaciones de forma organizada gracias a la especialización, así como permitir llevar registros dentro de la aplicación y facilitar operaciones como la creación de modelos. 

Arquitectura Por Capas 

La arquitectura por capas consiste en un estilo de desarrollo que busca dividir sistemas complejos de Software en múltiples capas, donde cada capa se enfoca en funciones y responsabilidades específicas con un jerarquía lógica, usualmente se divide en tres capas, presentación, lógica de negocios y acceso de datos (Tu, Z. 2023) es un estilo arquitectónico utilizado frecuentemente, debido a que la división de responsabilidades permite que cada capa maneje solo la información que necesita, es más fácil de mantener y permite la reutilización. 

Se implementará este tipo de arquitectura para mantener orden y separación entre responsabilidades del sistema, usando un patrón Modelo Vista Controlador para el manejo y división de responsabilidades de lógica de negocio, conexión con la interfaz del usuario y conexión con la base de datos del sistema. 

**2.3.** Formulación de Hipótesis 

31 

El desarrollo de un sistema que obtiene datos de prendas basándose en color, ocasión y considerando el guardarropa del usuario, facilita el proceso de elección de un atuendo, optimizando tiempo en este proceso, al integrar conceptualización, visión por computador y un algoritmo de optimización combinatoria. 

## **3.** Metodología de Desarrollo de Software 

Hemos decidido utilizar la metodología de desarrollo de software de Extreme Programming (XP), debido a que se trata de una metodología enfocada en el trabajo iterativo, la retroalimentación y 

## **¿Qué es XP?** 

En el desarrollo de software, las metodologías tradicionales han sido 

constantemente cuestionadas debido a su burocracia en exceso y su rigidez en la práctica, ocasionando repetidas veces el retraso o el ritmo en el trabajo de un equipo y dificultando su adaptación cuando cambios surgen en los requerimientos de los proyectos. Una respuesta a estas limitaciones fueron el surgimiento de las metodologías ágiles, entre ellas se constituyó una denominada Extreme Programming (XP) que se ha consolidado como una de las mas utilizadas por equipos de desarrollo de software en los últimos tiempos. En palabras de Joskowicz: 

Extreme Programming (XP) surge como una nueva manera de encarar proyectos de software, proponiendo una metodología basada esencialmente en la simplicidad y agilidad. Las metodologías de desarrollo de software 

tradicionales (…) aparecen, comparados con los nuevos métodos propuestos en XP, como pesados y poco eficientes (Joskowicz, 2008, p. 4). 

Este planteamiento permite comprender a XP como metodología ágil, además, nos da una visión de la filosofía de trabajo centrada en la simplicidad, adaptabilidad al cambio y la colaboración entre los miembros del equipo y los clientes. Para una aplicación web que tiene como fin generar atuendos en base a principios básicos de la 

32 

moda y un contexto de uso, desarrollado por un equipo de únicamente 2 personas, XP ofrece un marco flexible y bastante práctico que evita procesos innecesarios, facilitando de esta manera la entrega temprana y continua de resultados confiables. 

Trabajar de este modo, se pueden validar funcionalidades principales de manera 

rápida y eficaz, como la generación de combinaciones de prendas y adaptarlas en función de retroalimentación recibida constantemente, asegurando que el software evolucione al ritmo de las necesidades reales del proyecto. 

## **Principios y Valores** 

En las metodologías de desarrollo existen múltiples principios, valores y prácticas que definen la forma en que se trabajan, XP no es diferente en este aspecto, podemos distinguir 5 valores principales. 

- Comunicación: Al desarrollar software es importante entender las necesidades del cliente para su posterior implementación, es importante además, saber comunicarse con los demás miembros del equipo, lo que en esta metodología suele hacerse a través de herramientas de dibujo 

- Simplicidad: Se debe hacer las cosas tan simple como sea posible a través de la planeación, esto para evadir cosas innecesarias y ayuda a los desarrolladores a concentrarse, esto también promueve el trabajar en requerimientos actuales y no en aquellos que podrían existir en el futuro. 

- Retroalimentación: En XP se realizan iteraciones múltiples del sistema, la retroalimentación constante de del trabajo previo puede ayudar a identificar áreas de mejora y simplificar el diseño 

- Coraje: Si algo en los que se trabaja no funciona o no produce resultados provoca incertidumbre y temor, en esos momentos es importante mantener los demás principios en mente y actuar para evitar que se haga daño al equipo 

33 

- Respeto: Todos los miembros del proyecto, clientes y programadores deben 

tener un respeto mutuo, así como aceptar la retroalimentación que permitirá que el proyecto tenga éxito (Shrivastava et al., 2021) 

Podemos distinguir además múltiples principios que rigen el trabajo dentro de XP 

- Humanidad: Pues el software es desarrollado por gente 

- Economía: Es necesario añadir valor al negocio 

- Beneficio Mutuo: Siempre buscar que todas las partes se beneficien 

- Reutilización: Si algo funciona dentro de una situación se puede intentar aplicarlo en otras 

- Mejora: En XP siempre se debe buscar el mejoramiento de procesos, buscando alcanzar la perfección 

- Diversidad: Para solucionar problemas de forma efectiva se requiere de una gran variedad de habilidades, esto podría causar conflictos cuando existen múltiples 

soluciones o enfoques posibles, es importante saber lidiar con estos conflictos 

- Reflexión: Siempre preguntarse el cómo y el por qué funciona 

- Flujo: Preferir un flujo continuo de desarrollo, garantizando integración continua 

- Oportunidad: Ver los problemas como oportunidades para el cambio 

- Redundancia: Los problemas difíciles o críticos deberían resolverse de múltiples formas distintas 

- Fracaso: El principio del ensayo y error, intentar las cosas incluso cuando fallan y aprender del fracaso 

- Calidad: Entender que en XP la calidad no es una variable de control, siempre 

busca calidad alta y controla el proyecto ajustando el alcance según sea 

necesario 

34 

- Pasos Pequeños: Muchos pasos pequeños suelen ser más rápidos que 

zancadas largas, además de ofrecer mayor control 

- Responsabilidad Aceptada: La responsabilidad por completar tareas se debe tomar, no asignar (Bell, J. T. 2001) 

Es importante que el equipo comprenda y aplique estos valores, pues son la 

base del desarrollo XP, que definen las prácticas que se utilizaran en el desarrollo, no adoptar estos valores sería igual que no aplicar XP, son valores que permiten el desarrollo organizado del sistema, así como definir la forma en que se deben afrontar las situaciones y problemáticas que se presentarán durante el desarrollo 

## **¿Por qué aplicar XP?** 

La elección de una metodología adecuada depende tanto de las características del proyecto como la conformación del equipo. De esta manera, Extreme Programming (XP) se distingue por priorizar la comunicación constante y asertiva, la retroalimentación constante y la simplicidad en las soluciones, lo que la convierte en una opción idónea para proyectos con alta incertidumbre o un equipo pequeño. 

XP se basa en realimentación continua entre el cliente y el equipo de desarrollo, comunicación fluida entre todos los participantes, simplicidad en las soluciones implementadas y coraje para enfrentar los cambios. XP se define como especialmente adecuada para proyectos con requisitos imprecisos y muy cambiantes, y donde existe un alto riesgo técnico (Letelier & Penadés, 2006, p. 11). 

Esta perspectiva se alinea con el equipo de trabajo para aplicación web, ya que, la preocupación no es solamente generar combinaciones de atuendos basados en reglas básicas de la modas y contexto de uso, sino también adaptarse a la retroalimentación que pueden aportar diferentes usuarios, añadido a la 

35 

retroalimentación y cambios técnicos, la aplicación requiere integrar las reglas y contextos que pueden volverse complejos si no se gestionan con cuidado. 

Aplicar XP implica buscar la solución mas simple que funcione, evitando que el sistema cargue con reglas innecesarias o diseños rígidos. Al mismo tiempo, el principio del “coraje” en XP, permite introducir ajustes importantes, como nuevas categorías de prendas, distintos contextos de uso o mejoras en la lógica del algoritmo generador sin frenar el avance continuo del proyecto, de esta manera, el desarrollo puede ser sostenible con el tiempo. 

## **¿Cómo se aplicará XP?** 

Existen múltiples prácticas definidas para el trabajo en XP, dichas prácticas permitirán el desarrollo eficiente del sistema así como la prevención y solución de problemas, asegurando siempre la calidad. 

Los equipos de XP son pequeños y manejan una forma de planear y registrar simple para decidir lo que se va a hacer y predecir cuándo se finalizará el proyecto, se enfoca en ofrecer valor, el equipo desarrolla el software en una serie de pequeños lanzamientos que pasan los tests del cliente, es importante que se realicen pruebas constantes al código, manteniendo un diseño simple y mejorándolo de forma continua para que se mantenga consistente con las necesidades, los programadores trabajan en pares y codifican de forma consistente, para que todos puedan leer y entender el código (Jeffries, n.d.) 

El equipo consiste en dos desarrolladores, un equipo pequeño, por lo que es posible mantener comunicación de forma constante como requiere la metodología XP, adicionalmente se realizan pruebas de forma constante a las funcionalidades del software para asegurar que operan de forma correcta. 

36 

XP posee un conjunto de prácticas centrales que guían el desarrollo procedemos a explicarlas según dos fuentes anteriormente citadas Jeffries y Shrivastava, así como explicar la importancia de dichas prácticas dentro del proyecto 

- Equipo: Existen múltiples roles en XP, es necesario que exista un cliente con 

conocimiento en lo necesario en el negocio, programadores, testers, un coach que mantiene al equipo en el camino, lo especial es que en XP no es necesario que una sola persona se ocupe de un solo rol, los roles se toman según las capacidades de los miembros del equipo, no se cuenta con especialistas sino con un contribuidores con habilidades especiales (Jeffries, n.d.) Es importante aclarar lo vital que resulta la presencia del cliente durante las etapas del proyecto debido a los constantes cambios y para evitar situaciones donde sea necesario asumir (Shrivastava et al., 2021) 

Como se mencionó con anterioridad el equipo de desarrollo es pequeño por lo que la definición de requerimientos, la programación y el testeo son actividades de las que se encargan los dos miembros en conjunto. 

- Juego de Planeación: Existen dos pasos clave en la planeación de XP, 

planeación del lanzamiento, donde el cliente presenta características deseadas, se estima la dificultad y los costos, y se conoce la importancia de cada característica, las prioridades y los estimados no suelen ser sólidos, solo se sabe la velocidad a la que se puede trabajar una vez se inicia el desarrollo, se realiza un plan de proyecto y de lanzamiento, el cual se revisa de forma regular, el segundo paso es la planeación de iteración, donde al equipo se le dan direcciones cada par de semanas, se itera cada dos semanas, al final de las cuales se entrega software utilizable, en esta etapa se presentan las 

características deseadas para las siguientes dos semanas, se establecen tareas 

37 

y costo y se asume trabajo con base en lo realizado la semana anterior. (Jeffries, n.d.) es importante en esta etapa definir qué características son de mayor importancia y cuales se pueden posponer, en otras palabras definir un alcance y prioridades, de igual forma se deben definir fechas, es decir cuando debe el 

equipo lanzar la siguiente actualización y cuánto esfuerzo será requerido, esto se puede hacer definiendo la complejidad de las tareas, lo que se puede realizar a través del análisis del tiempo invertido en tareas previas, a través de esto podemos definir el tiempo ideal de ingeniería, que define el esfuerzo requerido (Shrivastava et al., 2021) 

Es importante el realizar un proceso de planeación al momento de iniciar un proyecto o una iteración, el equipo realizará múltiples iteraciones planeando tareas y características para las semanas que correspondan y realizando planes respeto al lanzamiento, definiendo todas las características necesarias y los recursos necesarios para su cumplimiento 

- Pequeños Lanzamientos: En XP existe un enfoque iterativo, el equipo lanza software funcional y probado que aporta el valor solicitado por el cliente en cada iteración, el cliente puede entonces evaluar el software, o incluso lanzarlo al público, lo importante es que el software es visible y se le entrega al cliente trás cada iteración, de esta forma el trabajo es transparente y tangible, en XP hay un énfasis en integración continua, consistente en realizar lanzamientos con las solicitudes de los clientes de manera continua. (Jeffries, n.d.) Esto es además importante debido a los posibles cambios que se pueden realizar en los requerimientos, al realizar pequeños lanzamientos dichos cambios se pueden adoptar de forma rápida, evitando confusiones y reduciendo errores (Shrivastava et al., 2021) 

38 

Es importante realizar lanzamientos de forma continua tras cada 

iteración, principalmente con el propósito de recibir retroalimentación de forma consistente y permitir que el cliente sea consciente del avance del proyecto y lo que se está desarrollando, es a través de esta estrategía que se pueden planear 

acciones correctivas o de mejora dependiendo de la retroalimentación 

- Diseño Simple: Los equipos de XP construyen software según un diseño simple pero adecuado, manteniéndolo así a través de pruebas y mejoras de diseño, el diseño se mantiene siempre enfocado en las funcionalidades actuales del sistema, el diseño no se realiza una sola vez en XP, es algo que se realiza y refina a través de todo el proceso de desarrollo. (Jeffries, n.d.) Es recomendable que el código sea fácil de entender y que no tenga demasiadas clases, funciones o métodos, para permitir que el código se pueda entender sin la necesidad de mucha documentación. (Shrivastava et al., 2021) 

Al tratarse de un sistema que no requiere de muchas funcionalidades, el equipo puede mantener un diseño simple, es importante que el equipo se enfoque en construir el software con las funciones definidas en el presente, asegurándose de mantener cada iteración con un diseño simple y evitando crear clases o métodos de forma innecesaria 

- Programación por pares: Consiste en una práctica de desarrollo donde dos 

programadores trabajan en la misma computadora, codificando y revisando el código al mismo tiempo, de esta forma el código es revisado por al menos un desarrollador, de esta forma se puede producir mejor código. (Jeffries, n.d.) Funciona porque mientras un desarrollador codifica el otro puede pensar y planear, en este proceso los desarrolladores van intercambiando roles y así mejoran la calidad del código (Shrivastava et al., 2021) 

39 

Esta práctica es apropiada para el equipo al tratarse de un equipo reducido conformado por dos personas, es importante para los desarrolladores reconocer el valor que tiene no solo la escritura de código sino que también su revisión en busca de mejoras, apegándose a los principios de XP para buscar la perfección. 

- Test Driven Development: XP tiene un enfoque en la retroalimentación, pero para esto es necesario realizar buenos tests, para esto se puede realizar un desarrollo orientado por tests, donde se realizan cortos ciclos de trabajo y se añaden tests, de esta forma podemos tener una cobertura de pruebas muy amplia, se realizan tests unitarios que deben funcionar cada vez que se realice alguna modificación o progreso en el código (Jeffries, n.d.) Adicionalmente es importante que los clientes generen casos de testeo para asegurar el 

funcionamiento apropiado y la pronta comunicación de errores y problemas. (Shrivastava et al., 2021) 

Durante el desarrollo se realizarán pruebas a cada componente del 

software tan pronto se haya construido para asegurar su correcto funcionamiento e integración con los demás componentes, asegurándose de recibir e 

implementar la retroalimentación que surja durante el proceso 

- Refactorizado: Se trata de un proceso que busca mejorar el diseño del sistema durante el proceso de desarrollo, se enfoca en remover duplicados y aumentar la cohesión del código, de esta forma se obtiene un diseño simple y se mantiene a través del desarrollo (Jeffries, n.d.) Por otro lado Shrivastava explica que el código debe ser flexible al cambio sin afectar el funcionamiento, esto debido a la naturaleza cambiante del negocio. (Shrivastava et al., 2021) 

40 

Se debe desarrollar el software teniendo en cuenta la posibilidad de que el mismo cambie, ya sea por la necesidad de actualizarlo debido al paso del tiempo, o por cambios en el negocio y las necesidades 

- Integración Continua: En XP el sistema se debe mantener integrado, es decir 

que se realizan builds constantemente y las nuevas funciones se integran al sistema principal de forma casi inmediata, de esta forma evitamos problemas como que al juntar el código de múltiples desarrolladores en una build, el sistema falle y nadie sepa porqué (Jeffries, n.d.) Adicionalmente correr el 

software de forma constante asegura que siempre exista una versión funcional y ejecutable del sistema, una práctica es tener una máquina dedicada donde los desarrolladores puedan implementar el código y deshacer si algo no funciona. (Shrivastava et al., 2021) 

Como se dijo anteriormente, el equipo buscará realizar pruebas de forma constante cada que se realice un cambio, una vez se superen las pruebas, se realizará la integración de forma que el equipo se pueda asegurar de que el sistema funciona tras los cambios y en caso de que no, poder descubrir el motivo con mayor facilidad 

- Estándares de Codificación: El equipo debe establecer y seguir estándares de codificación comunes de manera que todo el código del sistema parece construido por una sola persona, esto permite que el código se vea familiar y entendible (Jeffries, n.d.) 

Al momento de desarrollar el sistema es necesario establecer reglas dentro del equipo para mantener el código consistente y entendible, estas reglas incluyen la forma en que se nombran y definen variables, funciones y clases así 

41 

como la división de los archivos y los patrones de diseño y arquitectónicos de 

software 

- Metáfora: Los equipos de XP tienen una visión común de cómo funciona el 

sistema, a esto se le conoce como metáfora, puede ser poética, es decir una comparación que permite explicar el sistema de forma sencilla, o suele bastar con definir un sistema de nombres que permite que el equipo sepa dónde se ubica y que hace cada parte (Jeffries, n.d.) 

Para el sistema actual se utilizan principalmente nombres cotidianos, como guardarropa para referirse al sistema de registro y almacén de prendas del usuario o generador para el algoritmo que se encarga de formar atuendos a través de las características de las prendas almacenadas en el guardarropa, crear una metáfora para el sistema es importante pues permite una fácil explicación del sistema para el público general, permitiendo que lo comprendan y generando interés 

- Paso y Desarrollo Sostenible: Con esto se hace referencia a que los equipos de desarrollo XP trabajan en el proyecto a largo plazo, por lo que es importante definir un paso o ritmo que sean capaces de mantener de forma indefinida, esto significa que se realiza tiempo extra cuando es efectivo y normalmente se trabaja de forma que se maximice la productividad cada semana (Jeffries, n.d.) Básicamente lo que defiende XP y desarrolladores como Kent Beck es que de nada sirve el sobreesfuerzo, y que se debe llevar un ritmo de trabajo saludable de máximo 40 horas a la semana, lo que permite que los desarrolladores se mantengan frescos a través de la semana y sean capaces de llegar cada día y cada semana con disposición positiva y llenos de ideas (Shrivastava et al., 2021) 

42 

Definir un ritmo de trabajo que el equipo sea capaz de mantener es vital, un equipo cansado o que realiza avances de forma inconsistente llevará a un desarrollo con resultados poco favorables, por lo que es importante definir la cantidad de tiempo de trabajo de forma que se realicen avances significativos pero no al costo de la disposición del equipo. 

- Apropiación Colectiva del Código: En XP cualquiera puede mejorar el código cuando quieran, permitiendo que el código reciba la atención de múltiples personas, lo que suele llevar a código de mayor calidad y con menos defectos, además, esta práctica elimina problemas que se pueden presentar cuando solo un individuo maneja partes del código, pues se puede dar que una persona requiere de un componente del código que corresponde a otro miembro, pero dicho miembro aún no realiza esa parte de su código por estar ocupado con otras áreas que le conciernen más en el momento, entonces el primer desarrollador podría optar por crear esa parte del código en su área, esto puede fácilmente llevar a duplicaciones de código y en general que este sea difícil de entender (Jeffries, n.d.) Adicionalmente, esta práctica permite obtener retroalimentación de forma instantánea y permite que cualquiera con la capacidad de realizar mejoras las realice, además, gracias a las pruebas automatizadas, los desarrolladores pueden codificar sin temor. (Shrivastava et al., 2021) 

Al tratarse de un equipo pequeño, se es consciente de la importancia de compartir responsabilidades y realizar mejoras o cambios cuando se es capaz, el equipo es dueño del proyecto y buscará su mejora continua a través de una colaboración mutua en todo el proceso 

## **Conclusión** 

43 

En conclusión, XP no solo destaca por su adaptabilidad al cambio constante, sino también por su énfasis en la simplicidad y fortalecimiento del equipo, “La implementación de soluciones simples y la capacidad de adaptación a los cambios son aspectos clave de XP” (Gomescasseres Barbosa & Barros Caballero, 2024, p. 22). Los 

factores que se mencionan aquí son importantes en un proyecto con un equipo pequeño, donde la eficiencia y la comunicación directa son cruciales para avanzar con rapidez el desarrollo. 

Adicionalmente, XP provee de distintos valores, principios y prácticas que permiten un trabajo rápido y que asegure siempre la calidad, satisfacción del cliente e incluso la satisfacción del equipo de desarrollo, a través de la retroalimentación continua, el testeo constante, el trabajo en conjunto y la definición de objetivos, de igual forma gracias a su enfoque iterativo, el equipo es capaz de generar valor y avances de forma constante, así como recibir retroalimentación y corregir errores de forma continua, la flexibilidad y la simplicidad son prioridad en XP, lo que significa que al aplicar esta metodología el equipo será capaz de adaptarse al mundo en constante cambio que representa el desarrollo de software 

## **4.** Resultados de la Investigación 

## **4.1.** Levantamiento de Requerimientos 

Para el desarrollo de un sistema de software resulta de vital importancia el conocer las necesidades específicas del sistema, a través de los requisitos funcionales 

y no funcionales, es posible definir las características con las que contará el sistema descrito 

## **4.1.1.** Requisitos Funcionales 

Los siguientes requisitos funcionales fueron recopilados por el equipo para 

definir las funcionalidades que puede realizar el sistema, es decir, las actividades operativas y las características que permiten operar el software. 

44 

_**Tabla de Requisitos Funcionales**_ 

|**ID**|**Nombre**|**Descripción**|**Razón**|**Prioridad**|
|---|---|---|---|---|
|**RF001**|Registro|El<br>usuario debe<br>ser capaz de<br>crear una<br>cuenta<br>definiendo un<br>nombre y<br>contraseña|Permitir<br>que los<br>usuarios creen<br>una cuenta de<br>usuario<br>personal para<br>poder realizar<br>el registro de<br>prendas y<br>creación de<br>atuendos.|Media|
|**RF002**|Inicio de<br>Sesión|El<br>usuario debe<br>ser capaz de<br>ingresar a su<br>cuenta|Manten<br>er las sesiones<br>y datos de los<br>usuarios<br>asiladas.|Media|
|**RF003**|Tomar<br>fotos de<br>prendas para<br>añadirlas a la<br>base de datos|El<br>usuario debe<br>ser capaz de<br>tomar fotos de<br>sus prendas|Usar las<br>prendas del<br>usuario para la<br>generación de<br>atuendos|Alta|



45 

|||para añadirlas<br>a un inventario<br>personal en la<br>base de datos|personalizados.||
|---|---|---|---|---|
|**RF004**|Asignar<br>atributos a las<br>fotos de las<br>prendas|El<br>sistema a<br>través de<br>machine vision,<br>determina el<br>contexto, color<br>y tipo de<br>prenda y<br>almacena la<br>información en<br>la base de<br>datos a manera<br>de objeto|Es<br>necesario<br>definir las<br>características<br>de las prendas<br>del usuario a<br>través de las<br>fotografías<br>debido a que<br>esta<br>información es<br>la que permite<br>la operación<br>del algoritmo|Alta|
|**RF005**|Ver y<br>eliminar<br>objetos que<br>representan<br>prendas o<br>atuendos del|El<br>usuario puede<br>ver su<br>inventario<br>personal, así<br>como los|Manten<br>er un<br>guardarropa<br>virtual<br>personalizado<br>a partir de los|Media|



46 

||inventario del<br>usuario|elementos<br>almacenados<br>en el mismo y<br>eliminar los<br>objetos que<br>desee|gustos del<br>usuario||
|---|---|---|---|---|
|**RF006**|Seleccio<br>nar un color<br>principal como<br>parámetro<br>durante el<br>proceso de<br>generación|En la<br>pantalla de<br>generación de<br>atuendo, al<br>usuario se le<br>mostrará un<br>campo de<br>selección<br>opcional que<br>permite la<br>selección de un<br>valor de color,<br>que será<br>priorizado por<br>el algoritmo en<br>la selección de<br>elementos para<br>el resultado|Tener<br>una opción<br>extra para<br>personalizar la<br>generación del<br>atuendo|Media|



47 

|||final|||
|---|---|---|---|---|
|**RF007**|Seleccio<br>nar una<br>ocasión como<br>parámetro<br>durante el<br>proceso de<br>generación|En la<br>pantalla de<br>generación de<br>atuendo, al<br>usuario se le<br>mostrará un<br>campo de<br>selección que<br>permite el<br>asignar un<br>valor al<br>contexto,<br>permitiendo<br>elegir entre<br>formal y casual,<br>este valor será<br>utilizado<br>durante el<br>proceso de<br>generación<br>para priorizar<br>determinados<br>elementos|Tener<br>un contexto de<br>uso es clave<br>para una<br>generación de<br>atuendos<br>coherentes<br>para cada<br>momento.|Alta|



48 

|**RF008**|Aceptar<br>los parámetros<br>definidos y<br>generar un<br>atuendo acorde<br>a estos|En la<br>pantalla de<br>generación, el<br>usuario, tras<br>introducir los<br>valores<br>deseados,<br>podrá solicitar<br>que sistema<br>que genere un<br>atuendo<br>siguiendo las<br>condiciones<br>definidas a<br>través de un<br>botón|Permitir<br>que el usuario<br>finalice el<br>proceso de<br>generación y<br>obtenga el<br>resultado final|Alta|
|---|---|---|---|---|
|**RF009**|Seleccio<br>nar un objeto<br>específico del<br>inventario como<br>parámetro para<br>que sea<br>tomado como<br>el centro del|Durante<br>el proceso de<br>generación, el<br>usuario tiene la<br>opción de<br>especificar un<br>elemento para<br>que el sistema|Darle<br>una mayor<br>personalización<br>al atuendo<br>generado en<br>caso de que el<br>usuario desee<br>usar una|Alta|



49 

||proceso de<br>generación|lo utilice y tome<br>en cuenta sus<br>características<br>definidas para<br>la generación<br>del resultado<br>final|prenda en<br>específico||
|---|---|---|---|---|
|**RF010**|Tras el<br>proceso de<br>generación,<br>mostrar en<br>pantalla el<br>resultado final<br>creado por el<br>software|Tras la<br>pulsación del<br>botón<br>“Generar” el<br>sistema debe<br>enviar las<br>características<br>definidas por el<br>usuario al<br>algoritmo para<br>que las utilice<br>en la creación<br>del resultado<br>final, trás esto,<br>el resultado<br>debe mostrarse<br>a través de las|El<br>usuario debe<br>ser capaz de<br>ver el resultado<br>final de la<br>generación<br>para poder<br>sacar valor del<br>sistema|Alta|



50 

|||imágenes de<br>los elementos<br>seleccionados<br>para el atuendo|||
|---|---|---|---|---|
|**RF011**|Guardar<br>resultado final<br>del proceso de<br>generación en<br>su inventario<br>personal en la<br>base de datos|A través<br>de un botón el<br>usuario puede<br>decidir si desea<br>almacenar el<br>resultado de la<br>generación<br>como un objeto<br>en la base de<br>datos|Permitir<br>el acceso<br>rápido y<br>reutilización de<br>atuendos<br>generados<br>previamente|Baja|
|**RF012**|Cerrar<br>sesión|El<br>usuario debe<br>ser capaz de<br>salir de su<br>cuenta|Por<br>cuestiones de<br>seguridad o en<br>caso de que<br>múltiples<br>usuarios<br>utilicen un<br>mismo<br>dispositivo|Baja|



51 

Fuente: Esta Investigación, a partir de Celi Parraga, R. & Bonné Andrade, M. (Celi-Párraga et 

al., 2023) 

Como se observa, los requisitos funcionales recopilados responden a una 

aplicación web completa, que sigue un flujo de actividades adecuado para el objetivo de 

facilitar el proceso de crear un atuendo según las necesidades del usuario. 

## **4.1.2.** Requisitos No Funcionales 

Los siguientes requisitos no funcionales, tienen como objetivo la definición del comportamiento del sistema de acuerdo a los atributos de calidad de la ingeniería de 

software, mientras los requisitos funcionales definen el qué, los siguientes requisitos 

definen el cómo 

_**Tabla de Requisitos No Funcionales**_ 

|**ID**|**Descripción**|**Atributo de Calidad**|
|---|---|---|
|**RNF001**|La generación de<br>atuendos se realizará en<br>menos de 5 segundos|Rendimiento|
|**RNF002**|El escaneo de una<br>prenda para añadirla al<br>guardarropa debe ser<br>menor a 5 segundos|Rendimiento|
|**RNF003**|Se impedirá el<br>acceso no autorizado a<br>cuentas de usuario el<br>99.98% de veces|Seguridad|



52 

|**RNF004**|La aplicación web<br>será compatible con<br>diferentes navegadores<br>como Google Chrome,<br>Firefox, Opera y Brave|Portabilidad|
|---|---|---|
|**RNF005**|La aplicación estará<br>disponible 24 horas los<br>siete días de la semana|Disponibilidad|
|**RNF006**|La aplicación es de<br>fácil uso e intuitiva en cada<br>uno de los proceso de<br>carga y visualización de los<br>outfits|Usabilidad|
|**RNF007**|El sistema podrá<br>manejar 200 solicitudes en<br>menos de 5 segundos|Fiabilidad|



Fuente: Esta Investigación, a partir de Celi Parraga, R. & Bonné Andrade, M. 

A través de los requisitos no funcionales vistos con anterioridad se define la 

calidad operativa del software a la que se busca llegar, estableciendo los criterios de 

aceptabilidad a los que se rige el aplicativo expuesto. 

**4.1.3.** Diagrama de Casos de Uso 

El diagrama de casos de uso se utiliza para definir cómo los actores que se ven 

involucrados en la operación del sistema interactúan con el mismo, esto a través de la 

53 

definición de casos de uso, situaciones en las que los actores utilizan las funciones del 

sistema. 

_**Figura 1: Diagrama de Casos de Uso - Inicio de Sesión**_ 

Fuente: Basado en el estándar oficial definido por la Standards Development 

Organization https://www.omg.org 

## _**Figura 2: Diagrama de Casos de Uso - Subir Fotos de Prendas**_ 

54 

Fuente: Basado en el estándar oficial definido por la Standards Development 

Organization https://www.omg.org 

## _**Figura 3: Diagrama de Casos de Uso - Generación de Atuendo**_ 

Fuente: Basado en el estándar oficial definido por la Standards Development 

Organization https://www.omg.org 

55 

De esta manera, los diagramas de caso de uso del proceso iniciar sesión o registrarse, subir fotos de prendas al guardarropa virtual y la generación del atuendo son una visual importante para representar las partes fundamentales de la aplicación web y cómo el usuario se involucra en ellas. 

## **4.2.** Análisis de Software 

Para el desarrollo de una aplicación web es importante modelar diferentes diagramas que proporcionan un panorama completo del sistema, que facilita el desarrollo del mismo, representan diferentes módulos core y permite comprender cómo diferentes actores interactúan con él. 

## **4.2.1.** Modelo del Aplicativo Según UML25 

Para crear los diferentes diagramas y modelos del sistema, el equipo se basó en 

los estándares que definen UML 2.5. 

## **4.2.1.1.** Diagrama de Contexto 

El diagrama de contexto permite dar un panorama de alto nivel a cualquier 

persona que desee entender las relaciones entre los actores y módulos del sistema. 

## _**Figura 4: Diagrama de Contexto**_ 

56 

Fuente: Basado en el estándar oficial definido por la Standards Development 

## Organization https://www.omg.org 

Este diagrama es de gran valor, porque permite conocer los módulos de la 

aplicación web en alto nivel, entendiendo los procesos que cada uno hace entre si para comunicarse formando un sistema completo. 

## **4.2.1.2.** Diagrama de Actividades 

El diagrama de actividades representa el flujo de los diferentes procesos dentro 

de un sistema, mediante actores en cada proceso donde hay acciones, estados y decisiones. 

## _**Figura 5: Diagrama de Actividades - Autenticación**_ 

57 

Fuente: Basado en el estándar oficial definido por la Standards Development 

## Organization https://www.omg.org 

_**Figura 6: Diagrama de Actividades - Guardarropa**_ 

Fuente: Basado en el estándar oficial definido por la Standards Development 

Organization https://www.omg.org 

## _**Figura 7: Diagrama de Actividades - Generación de Atuendos**_ 

58 

Fuente: Basado en el estándar oficial definido por la Standards Development 

Organization https://www.omg.org 

Los procesos claves de la aplicación web se ven representados en el diagrama 

de actividades, indicando el flujo esperado de cada actor en cada etapa. 

**4.2.1.3.** Diagrama de Secuencia 

Se trata de un diagrama que define una línea de vida, a través de la cual los 

distintos objetos y procesos intercambian información o mensajes, este tipo de diagrama se enfoca en dicho intercambio de mensajes para la realización de una función del 

sistema 

## _**Figura 8: Diagrama de Secuencia**_ 

59 

Fuente: Basado en el estándar oficial definido por la Standards Development 

Organization https://www.omg.org 

60 

## **4.2.1.4.** Diagrama de Clases 

A través del diagrama de clases se describe la estructura del sistema desde las 

clases utilizadas dentro del mismo, modelando tanto sus atributos, operaciones y 

relaciones 

_**Figura 9: Diagrama de Clases**_ 

Fuente: Basado en el estándar oficial definido por la Standards Development 

## Organization https://www.omg.org 

## **4.2.1.5.** Diagrama de Componentes 

A través del diagrama de componentes se definen las distintas partes o módulos 

que forman un sistema y la forma en que interactúan entre sí, cada parte cuenta con sus 

entradas, salidas e interfaces, que se envían entre los demás componentes del sistema 

## _**Figura 10: Diagrama de Componentes**_ 

61 

Fuente: Basado en el estándar oficial definido por la Standards Development 

## Organization https://www.omg.org 

## **4.2.1.6.** Diagrama de entidad relación 

El diagrama entidad relación, permite entender el módulo de la base de datos del sistema, este diagrama facilita la visualización de la organización de los datos, así como también el cómo se relacionan entre sí. 

## _**Figura 11: Diagrama Entidad Relación**_ 

62 

Fuente: Basado en el estándar oficial definido por la Standards Development 

Organization https://www.omg.org 

## **4.3.** Diseño del software 

En este apartado se mostrará el diseño visual del sistema a través de capturas de pantalla y mockups que permitirán darse una idea de cómo se visualizará y utilizará el sistema, tenemos los siguientes mockups realizados a través de la plataforma Figma 

## **4.3.1.** Página Principal 

Se trata de la primera página que visualizará el usuario al acceder al sistema, permitiendo acceder a las funcionalidades del sistema, crear cuenta e iniciar sesión, además de explicar el propósito del sistema al usuario 

## _**Figura 11: Diseño de Página de Inicio**_ 

63 

Fuente: Esta investigación 

## **4.3.2.** Páginas de Autenticación de Usuarios 

Dos páginas vitales para cualquier sistema, a través de estas se realiza el 

registro e inicio de sesión de usuarios para que puedan interactuar con el sistema y se guarden sus datos 

## _**Figura 11: Diseño de Página de Inicio de Sesión**_ 

64 

**==> picture [130 x 11] intentionally omitted <==**

**----- Start of picture text -----**<br>
Fuente: Esta investigación<br>**----- End of picture text -----**<br>


_**Figura 12: Diseño de Página de Registro**_ 

Fuente: Esta investigación 

## **4.3.3.** Página de generación de atuendo 

Se trata de una de las páginas principales del sistema, en esta el usuario podrá realizar la generación de atuendos, introduciendo determinados parámetros para definir el tipo de atuendo que desea generar. 

## _**Figura 12: Diseño de Página de Generación de Outfits**_ 

65 

Fuente: Esta investigación 

## **4.3.4.** Página de Guardarropa 

La última página relevante del sistema, en la página del guardarropa los usuarios podrán registrar sus prendas las cuales serán clasificadas automáticamente a través de la imágen subida por el usuario, utilizando el modelo pre entrenado de patrickjohncyh llamado fashion-clip. 

## _**Figura 13: Diseño de Página de Guardarropa**_ 

66 

Fuente: Esta investigación 

## **4.4.** Construcción del Software 

En esta sección se muestra lo referente a la construcción o codificación del 

sistema de software, empezando por la estructura general de archivos, cada página del sistema se almacena en su propia carpeta, las cuales funcionan como las rutas del sistema, en la carpeta server también podemos ver la API que se utilizó para consumir el servicio de Machine Vision que se utiliza para el manejo de clasificación de prendas, de igual forma en esta API se maneja la generación de atuendos. 

## _**Figura 14: Organización de Archivos**_ 

67 

Fuente: Esta investigación 

En la carpeta de components se tienen múltiples archivos con componentes reutilizables, algunos son propios del framework, aunque también se crearon algunos para esta aplicación. 

_**Figura 15: Organización de Archivos - Componentes**_ 

68 

Fuente: Esta investigación 

Finalmente tenemos las configuraciones generales del programa, un archivo 

para el manejo de Queries, otro para definir categorías de prendas y otro para crear el cliente de appwrite que nos conecta a la base de datos, además de las típicas opciones de configuración de tailwind y de Next.js 

## _**Figura 16: Organización de Archivos - Configuración General**_ 

69 

Fuente: Esta investigación 

Ahora se presentan algunas pantallas importantes, empezando por el cliente de 

appwrite, donde se realiza la conexión a los servicios de appwrite. 

_**Figura 17: Código de Cliente Appwrite**_ 

Fuente: Esta investigación 

70 

Esta es una captura de pantalla del código de una de las páginas, solo se 

muestra esta porque es en esencialmente lo mismo para las demás páginas. 

_**Figura 18: Código de Página Principal**_ 

Fuente: Esta investigación 

Para el manejo del registro de prendas se utilizó un modelo vista controlador, por 

lo que se manejan tres archivos para su registro, modelo, controlador y repositorio 

_**Figura 18: Código de Objeto para Prenda**_ 

Fuente: Esta investigación 

_**Figura 19: Código de Repositorio para Prendas**_ 

Fuente: Esta investigación 

71 

_**Figura 20: Código de Controlador para Prendas**_ 

Fuente: Esta investigación 

Finalmente, es importante mostrar la API de flask utilizada para el manejo de 

servicios de Machine Learning y para servir nuestro algoritmo, aquí se llama al modelo 

de machine learning, y se definen funciones para identificar el color dominante, así como identificar el contexto de uso y el tipo de prenda. 

_**Figura 21: Código de API Flask de Machine Vision**_ 

Fuente: Esta investigación 

- **4.5.** Pruebas de Software 

Se realizaron distintas pruebas para poder confirmar el funcionamiento 

adecuado del sistema, empezando por las pruebas funcionales, verificando el correcto 

funcionamiento de las operaciones realizadas por el sistema empezando por el registro 

de usuarios, registrando e iniciando sesión en cuentas de usuario. 

_**Figura 22: Prueba de registro**_ 

72 

Fuente: Esta investigación 

Se probaron las funcionalidades de registro de prendas con detección 

automática, verificando la precisión del sistema y el registro adecuado de las prendas en la base de datos 

_**Figura 23: Prueba de añadir prenda**_ 

Fuente: Esta investigación 

Tras el registro las prendas se muestran de forma apropiada en el guardarropa 

virtual del usuario. 

## _**Figura 24: Prueba de visualización del guardarropa virtual**_ 

73 

Fuente: Esta investigación 

Al intentar generar un atuendo con tan pocas prendas, que a la vez son tan 

diferentes, el sistema no puede crear alguna combinación por lo que retorna un mensaje. 

_**Figura 25: Prueba de generación con pocos ítems**_ 

Fuente: Esta investigación 

Se realizaron pruebas en el generador con una cuenta con muchas prendas, 

realizando pruebas con los parámetros básicos de contexto y color, así como añadiendo 

materiales 

_**Figura 25: Prueba de generación con materiales**_ 

74 

Fuente: Esta investigación 

Activando todos los parámetros permite hacer generaciones más precisas pero 

también requiere de más prendas. 

_**Figura 26: Prueba de generación con más prendas**_ 

Fuente: Esta investigación 

Se probó también la funcionalidad de crear atuendos con base en una prenda, 

seleccionando la prenda y los parámetros a considerar. 

## _**Figura 27: Prueba de generación seleccionando una prenda base**_ 

75 

Fuente: Esta investigación 

Y realizando la generación, se ignoran los parámetros escogidos antes y se usan los de la prenda para la generación. 

_**Figura 28: Atuendo generado con base en la prenda**_ 

Fuente: Esta investigación 

También se probó las funcionalidades de guardar atuendos generados, 

permitiendo nombrarlos y guardarlos en el guardarropa virtual. 

## _**Figura 29: Prueba de guardado**_ 

76 

Fuente: Esta investigación 

Se probó el funcionamiento de publicar atuendos junto con una descripción para 

que los demás usuarios puedan verlos. 

_**Figura 30: Prueba de publicación**_ 

Fuente: Esta investigación 

Los atuendos se muestran en el feed, donde se puede añadirlos a favoritos 

## _**Figura 31: Prueba de adición a favoritos**_ 

77 

Fuente: Esta investigación 

Adicionalmente a las pruebas funcionales, se realizaron pruebas unitarias para 

las funcionalidades principales, incluyendo el registro y obtención de prendas, de 

atuendos, de categorización, esto a través de mocks o datos falsos para simular el 

funcionamiento. 

_**Figura 32: Setup de pruebas unitarias en Next.js**_ 

Fuente: Esta investigación 

Y realizando las operaciones sobre los datos mock que hemos definido, de esta 

forma no se modifica la base de datos mientras se realizan pruebas de cada 

funcionalidad individual. 

78 

_**Figura 33: Pruebas unitarias con Next.js**_ 

Fuente: Esta investigación 

De igual forma se realizaron pruebas sobre la API de flask, verificando los procesos de clasificación de prendas así como procesos de verificación de 

compatibilidades entre los parámetros definidos. 

_**Figura 34: Pruebas unitarias de compatibilidad de API**_ 

79 

De igual forma se realizaron pruebas respecto a la creación de atuendos 

simples, incompatibilidad de prendas y la interacción entre los parámetros. 

_**Figura 35: Pruebas unitarias de combinación**_ 

Fuente: Esta investigación 

Todas las 19 pruebas realizadas al sistema se completaron con éxito. 

_**Figura 36: Pruebas de Next.js superadas**_ 

Fuente: Esta investigación 

Todas las 52 pruebas realizadas a la API de Flask fueron exitosas. 

## _**Figura 37: Pruebas de API superadas**_ 

Fuente: Esta investigación 

80 

Además de realizar pruebas exploratorias y probar las funcionalidades de la 

aplicación para asegurar que estas funcionen de forma correcta, no se presenten bugs y se obtengan los resultados esperados, también se pueden realizar otro tipo de pruebas automatizadas, como pruebas de seguridad a través de Owasp ZAP y pruebas de carga a través de Apache JMeter. 

Apache JMeter es un software para realizar pruebas de carga, se realizaron pruebas a la obtención de prendas de usuario a través de una petición GET de igual forma se probó la función de clasificar atuendo de la API a través de una petición POST, se realizaron dos pruebas con cargas distintas, la primera con 100 y 30 peticiones respectivamente y la segunda con 40 y 200 peticiones. 

_**Figura 38: Prueba de Carga - Primera Prueba**_ 

Fuente: Esta investigación 

_**Figura 39: Prueba de Carga - Segunda Prueba**_ 

Fuente: Esta investigación 

Podemos observar que el sistema fue capaz de manejar ambos volúmenes de 

solicitudes de forma correcta, sin tener errores, durante la primera prueba el tiempo de 

respuesta promedio para la solicitud GET fue de 301.81 ms, no muy alejado del 

81 

obtenido en la segunda con 297.44 ms, el mínimo fue de 194 ms, el máximo de 870 ms y mediana de 283 ms, podemos observar que empeoró muy ligeramente al aumentar la cantidad de solicitudes pasando a un mínimo de 198 ms, máximo de 826 ms y mediana de 283.5, los tres percentiles indican los valores por debajo de los cuales se encuentran el 90, 95 y 99 por ciento de los tiempos de respuesta, siendo estos respectivamente 510.6 ms, 664.7 ms y 869.03 ms para la primera prueba y para la segunda fueron 504 ms, 632.05 ms y 783.59 ms, finalmente tenemos las transacciones realizadas por segundos y las KB recibidas y enviadas por segundo, para la primera prueba fueron de 18.55 transacciones por segundo, 79.93 KB recibidas por segundo y 9.86 KB enviadas por segundo, se vió un aumento en los tres valores para la segunda prueba, casi el doble con 35.02 transacciones por segundo, 150.87 KB recibidas por segundo y 18.6 enviadas por segundo, la duplicación puede deberse a que se manejaron el doble de transacciones en dos ciclos durante la segunda prueba. 

Para el POST realizado a la funcionalidad de identificación de atuendo, podemos ver un rendimiento significativamente menor que en las peticiones GET, incluso usando menos peticiones con solo 30 y 40 en la primera y segunda prueba, aunque ninguna falló si se ve un rendimiento menor, esto porque POST llama a una API que utiliza un modelo de Machine Learning para Machine Vision, proceso que toma un tiempo, en todas las variables medidas se puede ver que la prueba de 30 solicitudes obtuvo mejores resultados que la de 40, en tiempos de respuesta para la primera prueba se obtuvo en promedio 21649.37 ms, con un mínimo de 3182 ms y un máximo de 30006 ms, así como una mediana de 23485 ms, el 90% se encontró por debajo de 27529.2 ms, el 95% por debajo de 29623.2 y el 99% por debajo de 30006, se realizaron 0.54 transacciones por segundo, 0.18 KB recibidas por segundo y 2.71 enviadas, la segunda prueba, ahora con 40, en tiempos de respuesta obtuvo en promedio 31436.75 ms, con un mínimo de 3994 ms y un máximo de 41157 ms, se obtuvo una mediana de 34402 

82 

ms, el 90% se encontró por debajo de 39553.1 ms, el 95% por debajo de 39963.25 y el 99% por debajo de 41157, se realizaron 0.51 transacciones por segundo, 0.17 KB recibidas por segundo y 2.56 enviadas 

Se realizaron pruebas con OWASP ZAP y se encontraron alertas de categoría media como el que se permitían peticiones a la API de flask desde cualquier dirección (Configuración incorrecta de Cross Domain), o que no se habían configurado las CSP, además de la falta de una cabecera Anti Click-Jacking, se realizaron modificaciones a la configuración de NEXT lo que causó que ahora esas advertencias no se muestren, ahora solo aparecen algunas advertencias referentes a la configuración de Content Security Policy, debido a que hay algunas configuraciones que era necesario 

deshabilitar para la renderización la página, algo relativamente común en determinados sitios web que utilizan ciertas características para la interfaz visual, como pueden ser el uso de imágenes externas, no se reportaron alertas de carácter grave y las de carácter leve son generalmente, cuestiones de configuración propia de NEXT.JS 

_**Figura 40: Prueba de Seguridad**_ 

Fuente: Esta investigación 

Para pruebas de rendimiento se empleó la extensión de Google Chrome 

Lighthouse con la herramienta de desarrollador integrada en el navegador. 

El análisis de rendimiento de la página de inicio indica que la aplicación tiene muy buen rendimiento, con un puntaje de 99 en rendimiento según Lighthouse, los tiempos clave como el First Contentful Paint (0.3 segundos) y Largest Contentful Paint (0.8 segundos) son muy bajos, quiere decir que, el contenido aparece de inmediato para 

83 

el usuario. El time blocking (50 milisegundos) también es mínimo, demostrando que la 

página responde ágilmente sin bloquear la interacción. Esto puede deberse a la interfaz sencilla si se presentan cambios grandes en el frontend las pruebas podrían variar en cada página de la aplicación. 

## _**Figura 41: Pruebas de Rendimiento**_ 

Fuente: Esta investigación 

El análisis de rendimiento de la página encargada de la generación de los atuendos muestra que la funcionalidad core tiene buena optimización y responde rápidamente, tiene un puntaje de 96 en rendimiento según Lighthouse evidenciando que el contenido se muestra casi de inmediato (FCP 0.3 segundos) y que el tiempo de bloqueo (10 milisegundos) es prácticamente nulo, lo que garantiza solicitudes del usuario de manera fluida. 

## _**Figura 42: Pruebas de Rendimiento**_ 

84 

Fuente: Esta investigación 

La página del guardarropa virtual muestra una caída en el puntaje total 

importante frente a las demás páginas siendo 70 en rendimiento, lo cual puede ser coherente por la naturaleza de la página, ya que aquí se hace carga de las imágenes de las prendas del usuario y se realizan operaciones comunicándose con el budget de imágenes de appwrite para saber cuales son las prendas superiores, inferiores y calzado del usuario así como también los atuendos creados por el usuario. 

Aunque el contenido inicial aparece rápido (0.3 segundos), la carga completa de las imágenes incrementa significativamente el tiempo (3.9 segundos) hasta que la página queda totalmente estable y usable (Total blocking time 150 milisegundos). También se observa un ligero desplazamiento visual durante la carga (0.142), cambiando los elementos de posición en el renderizado. Se hicieron optimizaciones orientadas al manejo de imágenes, mejorando la estructura de diseño para evitar los saltos de contenido. 

85 

_**Figura 43: Pruebas de Rendimiento**_ 

Fuente: Esta investigación 

La pantalla de perfil del usuario presenta un muy buen puntaje de 97 en 

rendimiento según Lighthouse. Esto se debe principalmente a que es una vista muy ligera, con pocos elementos visuales y sin procesos complejos que afectan la carga. El contenido se muestra casi de inmediato (0.3 segundos) y el tiempo de bloqueo es mínimo (10 milisegundos). Aunque el Largest Contentful Paint es ligeramente mayor por la carga de imagen de usuario (1.2 segundos), sigue estando dentro de los parámetros óptimos sin afectar la experiencia general. 

86 

## _**Figura 44: Pruebas de Rendimiento**_ 

Fuente: Esta investigación 

Las pruebas de carga, seguridad y rendimiento permitieron validar que el 

sistema no solamente funciona correctamente, sino que también es capaz de operar de manera estable, segura y eficiente bajo diferentes condiciones. Los diferentes análisis dan una perspectiva para identificar los cuellos de botella, detectar posibles 

vulnerabilidades y medir la experiencia real del usuario en cada sección de la aplicación. 

**5.** Repositorio Producto de Software 

El producto de software se encuentra en el siguiente enlace de GitHub desde el 

cual se puede realizar el pull para su utilización. 

- https://github.com/hamil312/outfit gen 

Se presenta una imágen del repositorio subido en la plataforma Github 

## **Figura 45: Repositorio en Github** 

87 

Fuente: Esta investigación 

De igual forma se adjunta la cantidad de commits semanales en cada mes del 

año para el proyecto. 

**Figura 46: Commits Semanales por Mes** 

Fuente: Esta investigación 

## **Conclusiones** 

A través de lo expuesto se evidenció el cumplimiento de los objetivos específicos y las 

etapas de desarrollo de un sistema de software, pasando por el análisis, definiendo necesidades para la determinación de requisitos, creando diagramas para establecer la 

estructura general del sistema y sus procesos, se realizaron diseños de las interfaces, se construyó el sistema y sus componentes, creando bases de datos, implementando sistemas de 

88 

autenticación, desarrollando la interfaz de usuario y los algoritmos para finalmente realizar pruebas de carga, seguridad y rendimiento. 

El desarrollo de la aplicación web PickurFit y demuestra la integración exitosa entre la tecnología y la moda en un entorno digital, a través de un sistema que permite asistir a usuarios en el proceso de selección de atuendos a través de un algoritmo que implementa reglas básicas de moda para realizar sugerencias con base en entradas del usuario básicas, como el contexto y el color 

Mediante herramientas como React, Flask, Sckit-learn, etc.. Se logró construir un sistema funcional que permite a los usuarios gestionar sus prendas, crear combinaciones personalizadas y obtener propuestas de atuendos adaptadas a sus preferencias. 

Para finalizar a través de lo descrito con anterioridad se describe un proyecto de 

desarrollo de software, desde el planteamiento del problema, la justificación, los antecedentes, hasta el proceso de desarrollo del software en cada una de sus etapas. 

## **Recomendaciones** 

Se plantean algunas recomendaciones respecto a pasos a futuro en el desarrollo del 

sistema de software. 

- Se recomienda continuar con la ampliación de las funcionalidades del sistema, 

incorporando mejoras en la precisión del análisis de imágenes y la personalización de recomendaciones mediante aprendizaje automático. 

- También es importante optimizar la interfaz de usuario, garantizando una experiencia fluida y atractiva que motive el uso continuo. 

- Se sugiere implementar pruebas con usuarios reales para obtener retroalimentación y fortalecer la aplicación en aspectos técnicos y de usabilidad antes de su despliegue final. 

89 

- Se recomienda implementar algoritmos que permitan personalizar la experiencia del 

usuario con base en sus interacciones con el sistema 

## **Referencias** 

Hester, N., & Hehman, E. (2023). Dress is a fundamental component of person perception. _Personality and Social Psychology Review_ , _27_ (4), 414–433. 

https://doi.org/10.1177/10888683231157961 

Johnson, K., Lennon, S. J., & Rudd, N. (2014). Dress, body and self: Research in the social psychology of dress. _Fashion and Textiles_ , _1_ (1). 

https://doi.org/10.1186/s40691-014-0020-7 

Cliff, M. (2016, 5 de junio). Marks & Spencer's found women spend six months of their working lives deciding what to wear. _Mail Online_ . 

https://www.dailymail.co.uk/femail/article-3626069/Women-spend-SIX-MONTHS-working -lives-deciding-wear.html 

Igini, M. (2024, 30 de mayo). _10 concerning fast fashion waste statistics_ . Earth.Org. 

https://earth.org/statistics-about-fast-fashion-waste/ 

Jalil, M. H., Shanat, M., & Moghadasi, K. (2022). Ecochildclo: A mobile application for customisation of children's clothing toward sustainability. _New Design Ideas_ , _6_ (3), 285–297. 

Rebello, S., Alphonso, E., & Wadkar, S. (2020). Outfit selection using colour matching application and image processing. _SSRN Electronic Journal_ . https://doi.org/10.2139/ssrn.3688391 

Semianchuk, S., & Shestakevych, T. (2020). The concept of an intelligent system of an outfit completion. _ECONTECHMOD: An International Quarterly Journal on Economics of Technology and Modelling Processes_ , _9_ (2). 

http://yadda.icm.edu.pl/baztech/element/bwmeta1.element.baztech-b45bba9a-81b4-48d 2-aae9-384a1be22b21 

90 

Zhang, B., & Wang, Q. (2019). Outfit helper: A dialogue-based system for solving the problem of 

outfit matching. _Journal of Computer and Communications_ , _7_ (12), 50–65. https://doi.org/10.4236/jcc.2019.712006 

Breward, C. (2019). Fashion. _Textile History_ , _50_ (2), 206–211. 

https://doi.org/10.1080/00404969.2019.1655937 

Niño, S. E. M. (2023). _La moda y sus lenguajes en el camino hacia la contemporaneidad_ . Agoston, G. A. (1987). _Color theory and its application in art and design_ . Springer. 

https://doi.org/10.1007/978-3-540-34734-7 

Jacobson, E. (1946). _The color harmony manual and how to use it_ (Vol. 14). Color Laboratories Division, Container Corporation of America. 

Doria, P. (2012). Consideraciones sobre moda, estilo y tendencias. _Cuadernos del Centro de_ 

_Estudios en Diseño y Comunicación. Ensayos_ , (42), 101–106. 

Abby. (2023, January 6). _How to mix and match patterns — classically Abby_ . **Classically Abby.** 

https://www.classicallyabby.com/fashion/how-to-mix-and-match-patterns 

Lopez, C. L. (2024, December 8). _The art of mixing and matching textures in fashion_ . **Current** 

## **Boutique.** 

https://currentboutique.com/blogs/cravingcurrent/the-art-of-mixing-and-matching-textures -in-fashion 

Grötschel, M., & Lovász, L. (1995). Combinatorial optimization. En R. L. Graham, M. Grötschel, & L. Lovász (Eds.), _Handbook of combinatorics_ (Vol. 2, pp. 1541–1597). Elsevier. 

Migueles, L. C., & Gordillo, P. C. (2014). La moda como lenguaje: Una comunicación no verbal. _AACA Digital: Revista de la Asociación Aragonesa de Críticos de Arte_ , (29). Snyder, W. E., & Qi, H. (2004). _Machine vision_ (Vol. 1). Cambridge University Press. Vaca, J. F. V., & Hernández, E. E. G. (2023). Incidencia del dress code en la gestión de la 

identidad corporativa de las cooperativas indígenas de Otavalo. _Polo del Conocimiento_ , _8_ (8), 1766–1781. 

91 

Domingo, G. (2013). _Las marcas de moda en un contexto digital: Retos y oportunidades_ . Pacheco Pazmiño, H. W. (2018). _Estudio de algoritmos de filtrado basado en contenidos para sistemas recomendadores de información_ . 

Hugging Face. (2021). _CLIP · Hugging face Documentation._ 

https://huggingface.co/docs/transformers/model_doc/clip#clip 

Medrano, J. F. (2018). Filtrado basado en contenido para artículos académicos en repositorios institucionales. En _XXIV Congreso Argentino de Ciencias de la Computación (La Plata, 2018)_ . 

Wegner, P. (1990). Concepts and paradigms of object-oriented programming. _ACM SIGPLAN OOPS Messenger_ , _1_ (1), 7–87. 

Tu, Z. (2023). Research on the application of layered architecture in computer software development. Journal of Computing and Electronic Information Management, 11(3), 34-38. 

Dodgson, N. A. (2019). What is the "opposite" of "blue"? The language of colour wheels (JPI-first). _Journal of Perceptual Imaging_ . 

https://www.ingentaconnect.com/contentone/ist/ei/2019/00002019/00000012/art00016 Raggett, D., Le Hors, A., & Jacobs, I. (1997). _HTML 4.01 specification_ . IETF HTML WG. Goldberg, J. (2022). _Learning TypeScript_ . O'Reilly Media. 

Grant, K. J. (2024). _CSS in depth_ . Simon and Schuster. Gackenheimer, C. (2015). _Introduction to React_ . Apress. 

Lazuardy, M. F. S., & Anggraini, D. (2022). Modern front-end web architectures with React.js 

and Next.js. _Research Journal of Advanced Engineering and Science_ , _7_ (1), 132–141. Gerchev, I. (2022). _Tailwind CSS_ . SitePoint. 

IBM. (2025, 22 de julio). _Relational databases_ . Think. 

https://www.ibm.com/think/topics/relational-databases 

Bartholomew, D. (2012). MariaDB vs. MySQL. _Linux Journal_ , _2012_ (10). 

92 

Aguilera Rubio, D. (2019). _Aplicación de gestión de imágenes en entornos forenses_ . Ghimire, D. (2020). _Comparative study on Python web frameworks: Flask and Django_ . Hackeling, G. (2017). _Mastering machine learning with scikit-learn_ . Packt Publishing. 

Paszke, A., Gross, S., Massa, F., Lerer, A., Bradbury, J., Chanan, G., … & Chintala, S. (2019). PyTorch: An imperative style, high-performance deep learning library. En _Advances in Neural Information Processing Systems_ , 32. 

Howse, J. (2013). _OpenCV computer vision with Python_ (Vol. 27). Packt Publishing. 

Wolf, T., Debut, L., Sanh, V., Chaumond, J., Delangue, C., Moi, A., … & Rush, A. M. (2019). 

HuggingFace's Transformers: State-of-the-art natural language processing. _arXiv_ , arXiv:1910.03771. 

Shrivastava, A., Jaggi, I., Katoch, N., Gupta, D., & Gupta, S. (2021). A systematic review on extreme programming. _Journal of Physics: Conference Series_ , _1969_ (1), 012046. https://doi.org/10.1088/1742-6596/1969/1/012046 

Joskowicz, J. (2008). Reglas y prácticas en eXtreme Programming. _Revista de ingeniería informática_ , (22). 

Letelier, P., & Penadés, M. C. (2006). Metodologías ágiles para el desarrollo de software: eXtreme Programming (XP). _Técnica Administrativa_ , _5_ (26). 

Gomescasseres Barbosa, E. A., & Barros Caballero, S. S. (2024). _Aplicación web para la_ 

_gestión de pedidos en restaurantes de comidas rápidas_ . 

Bell, J. T. (2001). Extreme programming. _Thinking for Innovation_ , 1–19. 

Jeffries, R. (s. f.). _What is extreme programming?_ Ron Jeffries. 

https://ronjeffries.com/xprog/what-is-extreme-programming/ 

Celi-Párraga, R. J., Boné-Andrade, M. F., Mora-Olivero, A. P., & Sarmiento-Saavedra, J. C. (2023). _Ingeniería del software I: Requerimientos y modelado del software_ . https://doi.org/10.55813/egaea.l.2022.21 

93 

