var colorScheme = document.documentElement.getAttribute("data-color-scheme");

if (colorScheme === "auto") {
    if (localStorage.getItem("theme") === "dark") {
      document.documentElement.setAttribute("dark", "");
      document.documentElement.classList.add('dark-mode');
    }
  } else if (colorScheme === "light") {
    document.documentElement.setAttribute("light", "");
    document.documentElement.classList.add('light-mode');
  } else if (colorScheme === "dark") {
    document.documentElement.setAttribute("dark", "");
    document.documentElement.classList.add('dark-mode');
  } else {
    if (localStorage.getItem("theme") === "dark") {
      document.documentElement.setAttribute("dark", "");
      document.documentElement.classList.add('dark-mode');
    }
  }
  