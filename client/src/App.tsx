import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/sonner";
import NotFound from "@/pages/not-found";
import RechargePage from "@/pages/RechargePage";
import SummaryPayment from "@/pages/SummaryPayment";
import KNETPayment from "@/pages/KNETPayment";
import SuccessPage from "@/pages/SuccessPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={RechargePage} />
      <Route path="/summary-payment" component={SummaryPayment} />
      <Route path="/knet-payment" component={KNETPayment} />
      <Route path="/success" component={SuccessPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
