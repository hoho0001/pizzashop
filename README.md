# pizzashop
Pizza shop multi pages
https://hoho0001.github.io/pizzashop/

In register page, user can't self-register as an admin because the API discards the isStaff properties on the registration route.
Only properly authenticated staff users can set the isStaff property for another user, using:  PATCH /auth/users/:id 

staff account: hoho0001@algonquinlive.com
password: Ho

