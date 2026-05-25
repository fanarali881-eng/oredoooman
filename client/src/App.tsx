import { Switch, Route } from "wouter";
import RechargePage from "@/pages/RechargePage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={RechargePage} />
      <Route>404 Not Found</Route>
    </Switch>
  );
}

function App() {
  return (
    <Router />
  );
}

export default App;
