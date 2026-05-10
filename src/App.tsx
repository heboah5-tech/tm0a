import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { OnlineTracker } from "@/components/online-tracker";
import { GoogleAnalytics } from "@/components/google-analytics";

import IndexPage from "@/pages/index";
import HomePage from "@/pages/home";
import HomeNewPage from "@/pages/home-new";
import MainPage from "@/pages/main";
import CheckPage from "@/pages/check";
import ComparPage from "@/pages/compar";
import ConfiPage from "@/pages/confi";
import InsurPage from "@/pages/insur";
import NafadPage from "@/pages/nafad";
import PhoneInfoPage from "@/pages/phone-info";
import VeriPage from "@/pages/veri";
import AdminPage from "@/pages/admin";
import NotFound from "@/pages/not-found";

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={IndexPage} />
        <Route path="/home" component={HomePage} />
        <Route path="/home-new" component={HomeNewPage} />
        <Route path="/main" component={MainPage} />
        <Route path="/check" component={CheckPage} />
        <Route path="/compar" component={ComparPage} />
        <Route path="/confi" component={ConfiPage} />
        <Route path="/insur" component={InsurPage} />
        <Route path="/nafad" component={NafadPage} />
        <Route path="/phone-info" component={PhoneInfoPage} />
        <Route path="/veri" component={VeriPage} />
        <Route path="/admin" component={AdminPage} />
        <Route component={NotFound} />
      </Switch>
      <Toaster />
      <OnlineTracker />
      <GoogleAnalytics />
    </WouterRouter>
  );
}

export default App;
