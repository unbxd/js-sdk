### Run http-server

Run `http-server` by installing  the [npm package](https://www.npmjs.com/package/http-server)

OR run it using npx

```
npx http-server
```

### Access the demo

Open the link generated by `http-server` in the browser


**Note**
In case you see that `unbxdSearch.js` is not loading in the browser (i.e. it is throwing 404), you have to create a soft link to the the search library JS using the below command from inside the `demo` directory


```
ln -s ../unbxdSearch.js unbxdSearch.js 
```