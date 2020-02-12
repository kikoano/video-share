const gateway = require("fast-gateway");
const fetch = require('node-fetch');
const cookieParser = require("cookie-parser");
const rateLimit = require('express-rate-limit')
const requestIp = require('request-ip')
const PORT = 8080;

const validateToken = async (req, res, next) => {
  const token = req.cookies.token;
  let tokenCookie = "";
  if (token !== undefined)
    tokenCookie = "token=" + token;
  const response = await fetch("http://localhost:8080/api/v1/auth", {
    mode: "cors",
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "Cookie": tokenCookie,
    }
  });
  const json = await response.json();
  if (response.ok) {
    req.payload = json;
    return next();
  }
  else {
    //try refresh
    const refreshToken = req.cookies.refreshToken;
    let refreshTokenCookie = "";
    if (refreshToken !== undefined)
      refreshTokenCookie = "refreshToken=" + refreshToken;
    const response = await fetch("http://localhost:8080/api/v1/refresh", {
      mode: "cors",
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Cookie": refreshTokenCookie,
      }
    });
    const json = await response.json();
    if (response.ok) {
      const cookieToken = response.headers.get("set-cookie");
      if (cookieToken !== null)
        res.setHeader("set-cookie", cookieToken);
      req.payload = json;
      return next();
    }
    else
      return res.send(json);
  }
}
const payloadHook = {
  async onRequest(req, res) {
    req.headers["id"] = req.payload["id"];
  }
}

gateway({
  middlewares: [
    require("cors")({
      origin: "http://localhost:8080"
    }),
    require("helmet")(),
    cookieParser()
  ],
  routes: [
    {
      prefix: "/api-docs",
      prefixRewrite: "/api-docs",
      target: 'http://localhost:7000',
    },
    {
      prefix: "/api/v1/register/",
      target: "http://localhost:3000"
    },
    {
      prefix: "/api/v1/login/",
      target: "http://localhost:3000"
    },
    {
      prefix: "/api/v1/auth/",
      target: "http://localhost:3000"
    },
    {
      prefix: "/api/v1/refresh/",
      target: "http://localhost:3000",
      middlewares: [
        // acquire request IP
        (req, res, next) => {
          req.ip = requestIp.getClientIp(req)
          return next()
        },
        // rate limiter
        rateLimit({
          windowMs: 1 * 60 * 1000, // 1 minute
          max: 6, // limit each IP to max requests per windowMs
          handler: (req, res) => {
            res.send('Too many requests, please try again later.', 429)
          }
        })
      ],
    },
    {
      prefix: "/api/v1/logout/",
      target: "http://localhost:3000",
      middlewares: [validateToken],
      hooks: payloadHook
    },
    {
      prefix: "/api/v1/test/",
      target: "http://localhost:3000",
      middlewares: [validateToken],
      hooks: payloadHook
    },
    {
      prefix: "/api/v1/users/",
      target: "http://localhost:3001",
      middlewares: [validateToken],
      hooks: payloadHook
    },
    {
      prefix: "/api/v1/users/:id",
      target: "http://localhost:3001",
      middlewares: [validateToken],
      hooks: payloadHook
    },
    {
      prefix: "/api/v1/videos/",
      target: "http://localhost:3002",
      middlewares: [validateToken],
      hooks: payloadHook
    }
  ]
}).start(PORT).then(server => {
  console.log(`API Gateway listening on ${PORT} port!`)
});