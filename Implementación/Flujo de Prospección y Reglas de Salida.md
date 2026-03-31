Por supuesto, aquí tienes la descripción en texto detallada paso a paso de cómo funciona este flujo de prospección a lo largo del tiempo, sus canales y sus reglas de salida:

## **El Flujo Principal (Día a Día)**

Esta es la ruta cronológica que sigue un prospecto si nunca responde a tus mensajes. El sistema va alternando canales para generar familiaridad sin parecer "spam":

1. **Día 1 (Correo):** Todo comienza enviando el **Email \#1**, que es un mensaje corto ofreciendo la auditoría de video.  
2. *Pausa de 3 días.*  
3. **Día 4 (LinkedIn):** Si no hubo respuesta, el sistema cambia de canal y envía una **Solicitud de conexión en LinkedIn** con una nota amable mencionando el correo anterior.  
4. *Pausa de 1 día.*  
5. **Día 5 (Correo):** Se envía el **Email \#2**, un seguimiento súper corto y directo por correo.  
6. *Pausa de 2 días.*  
7. **Día 7 (Teléfono):** Cambiamos al móvil. Se deja un **Buzón de Voz** automático (usando herramientas como Orum) y se envía un **SMS** con el enlace a la auditoría.  
8. *Pausa de 3 días.*  
9. **Día 10 (LinkedIn):** Se vuelve a la red social, pero esta vez de forma pasiva, haciendo **Engagement** (dando *like* o comentando) en alguna publicación del prospecto.  
10. *Pausa de 2 días.*  
11. **Día 12 (Correo):** Se envía el **Email \#3**, aportando valor con un caso de estudio o comparativa de la competencia.  
12. *Pausa de 3 días.*  
13. **Día 15 (WhatsApp \- LatAm):** Se envía una **Nota de voz por WhatsApp** (de menos de un minuto) exclusiva para prospectos en Latinoamérica, resumiendo el valor.  
14. *Pausa de 3 días.*  
15. **Día 18 (Teléfono):** Se realiza una **Llamada directa** (recomendado entre 4 y 5 PM) buscando conversar directamente.  
16. *Pausa de 3 días.*  
17. **Día 21 (Correo):** Se envía el **Email \#4 (Breakup/Ruptura)**, un último mensaje de muy baja presión despidiéndose y dejando la puerta abierta.

## ---

**Las Reglas de Salida (Cuándo termina el flujo)**

Todo este motor de envíos automáticos está vigilado constantemente. El prospecto solo puede salir de esta "rueda" de dos formas:

**Ruta A: El Éxito (Agendar Llamada) 🎯**

Durante los 21 días, el sistema y tu equipo están "escuchando". **Si en cualquier momento** el prospecto hace algo positivo (responde el Email \#1, acepta la conexión y responde en LinkedIn, contesta el SMS o toma la llamada telefónica), ocurren tres cosas al instante:

1. Las automatizaciones futuras **se cancelan inmediatamente** para ese prospecto (no le va a llegar el buzón de voz si ya agendó por correo).  
2. Se marca como "Éxito" en la base de datos.  
3. Sale de este flujo para pasar a manos de un vendedor que llevará la reunión.

**Ruta B: El Fin del Camino (Sin Contacto) 🛑**

Si el prospecto pasó por absolutamente todos los pasos de los 21 días, leyó el "Email de Ruptura" del Día 21 y aún así no respondió nada:

1. El tiempo expira.  
2. El sistema lo marca como "Sin respuesta" (Unresponsive).  
3. Sale de la secuencia activa y se mueve a una lista de *Nurturing* (Nutrición) para enviarle solo boletines mensuales o anuncios de remarketing, dejando de insistir directamente.

```
graph LR
    %% Configuración general
    Start([🚀 Inicio])

    %% Carriles (Eje Y)
    subgraph Correo [✉️ Correo Electrónico]
        E1[Día 1: Email #1]
        E2[Día 5: Email #2]
        E3[Día 12: Email #3]
        E4[Día 21: Email #4 Breakup]
    end

    subgraph Social [💼 LinkedIn]
        L1[Día 4: Solicitud]
        L2[Día 10: Engagement]
    end

    subgraph Tel [📞 Teléfono & SMS]
        T1[Día 7: Voicemail + SMS]
        T2[Día 18: Llamada Directa]
    end

    subgraph WA [💬 WhatsApp LatAm]
        W1[Día 15: Audio < 60s]
    end

    subgraph Salidas [🎯 Resultados / Salidas del Flujo]
        Win(((🎉 ÉXITO:<br>Agendar Llamada<br>y Salir)))
        Loss(((🛑 FIN:<br>Sin Contacto<br>Mover a Nurture)))
    end

    %% Secuencia en el Tiempo (Eje X) con Timers
    Start --> E1
    E1 -->|Espera 3d| L1
    L1 -->|Espera 1d| E2
    E2 -->|Espera 2d| T1
    T1 -->|Espera 3d| L2
    L2 -->|Espera 2d| E3
    E3 -->|Espera 3d| W1
    W1 -->|Espera 3d| T2
    T2 -->|Espera 3d| E4
    E4 -->|Termina el tiempo| Loss

    %% Flechas de Salida por Éxito (Cualquier interacción positiva)
    E1 -.->|Si Responde / Da clic| Win
    L1 -.->|Si Acepta / Responde| Win
    E2 -.->|Si Responde| Win
    T1 -.->|Si Contesta SMS| Win
    E3 -.->|Si Responde| Win
    W1 -.->|Si Contesta| Win
    T2 -.->|Si Contesta Llamada| Win
    E4 -.->|Si Responde| Win

    %% Estilos
    classDef email fill:#e1f5fe,stroke:#0288d1,stroke-width:2px;
    classDef social fill:#e8eaf6,stroke:#3f51b5,stroke-width:2px;
    classDef phone fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px;
    classDef chat fill:#e0f2f1,stroke:#00695c,stroke-width:2px;
    classDef win fill:#c8e6c9,stroke:#2e7d32,stroke-width:3px;
    classDef loss fill:#ffcdd2,stroke:#c62828,stroke-width:3px;
    
    class E1,E2,E3,E4 email;
    class L1,L2 social;
    class T1,T2 phone;
    class W1 chat;
    class Win win;
    class Loss loss;

```

