Skrypt wykonuje następujące zadania:

Łączy się z Firebase Firestore przy użyciu Firebase Admin SDK.

Umożliwia interaktywny wybór:

Nazwy kolekcji, z której mają być usunięte dokumenty.

Nazwy pola oraz wartości, która musi być spełniona (np. data równa konkretnej dacie).

Liczby dokumentów usuwanych w jednym batchu (domyślnie 500).

Opóźnienia (w milisekundach) między kolejnymi operacjami usuwania batchami.

Usuwa dokumenty spełniające zadany warunek w partiach, dopóki nie zostaną usunięte wszystkie pasujące dokumenty.