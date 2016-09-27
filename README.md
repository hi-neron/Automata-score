# SCORE MODULE

## Descripcion
Modulo encargado de hacer peticiones desde RealTime hasta a la base de datos

## NOTES
Features a cargo del modulo score, implementadas en la bd:

### Points
Maneja el puntaje del usuario
> tipo: integer.

En la base de datos tiene la funcion:
**addPoints** (<nombre_de_usuario>, points)
  - <Nombre de usuario> es el nombre del usuario al que se añadiran los puntos
  - points puede ser null, por defecto, addPoints() suma 1
  - se guarda en el <usuario>.points

### Skills
Guarda las habilidades que el usuario ha conseguido
> tipo: array

*. en la base de datos tiene la funcion:
**addSkill** (<nombre de usuario>, <nombre de la habilidad>)
  - <Nombre de usuario> es el nombre del usuario al que se añadiran los puntos
  - <Nombre de la habilidad> nombre de la habilidad que se quiere agregar al user

> **PD**: la skill debe existir en el sistema, utils.findSkill() tiene una lista
  para asegurarse de que asi sea

### Badges
Agrega logros a los usuarios
> tipo array

En la base de datos tiene la funcion:
**addBadge** (<nombre de usuario>, <nombre de la insignia>)
- <Nombre de usuario> es el nombre del usuario al que se añadiran los puntos
- <Nombre de la insignia> nombre de la insignia que se quiere agregar al user
> **PD**: la insignia debe existir en el sistema, utils.findBadge() tiene una lista
    para asegurarse de que asi sea

Este Ultimo hace parte del modulo <Duel> que tiene **BAJA PRIORIDAD** en desarrollo.

## Skills

## MIT License

Copyright (c) 2016 Jose Sánchez

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.