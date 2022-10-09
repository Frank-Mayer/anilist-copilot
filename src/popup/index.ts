import anilist from "../lib/settings.json";
import { auth } from "../lib/auth";

const loggedIn = (name: string) => {
  const el = document.createElement("p");
  el.innerText = "You are logged in as " + name;
  document.body.appendChild(el);
};

const notLoggedIn = () => {
  const el = document.createElement("a");
  el.innerText = "Login";
  el.href = `https://anilist.co/api/v2/oauth/authorize?client_id=${anilist.id}&response_type=token`;
  el.target = "_blank";
  document.body.appendChild(el);
};

auth().then((client) => {
  if (client) {
    client.query`
    {
        Viewer {
            name
        }
    }`
      .then((data) => {
        loggedIn(data.Viewer.name);
      })
      .catch((err) => {
        notLoggedIn();
      });
  } else {
    notLoggedIn();
  }
});
