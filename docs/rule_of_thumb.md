Rules
=====

1. Never add addtional method to iterator, only `next` and `__iterator__` are valid (no `hasNext`, `size`, etc).
2. Avoid intermediate state for generated iterated object or, if no feasible, minimize it.

