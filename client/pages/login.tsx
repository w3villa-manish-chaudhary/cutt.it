import { useFormState } from "react-use-form-state";
import React, { useEffect, useState } from "react";
import { Flex } from "rebass/styled-components";
import styled from "styled-components";
import Router from "next/router";
import axios from "axios";

import { useStoreState, useStoreActions } from "../store";
import { APIv2, DISALLOW_REGISTRATION } from "../consts";
import { ColCenterV } from "../components/Layout";
import AppWrapper from "../components/AppWrapper";
import { fadeIn } from "../helpers/animations";
import { Button } from "../components/Button";
import Text, { H2 } from "../components/Text";
import ALink from "../components/ALink";
import Icon from "../components/Icon";

const LoginForm = styled(Flex).attrs({
  as: "form",
  flexDirection: "column"
})`
  animation: ${fadeIn} 0.8s ease-out;
`;

const LoginPage = () => {
  const { isAuthenticated } = useStoreState((s) => s.auth);
  const login = useStoreActions((s) => s.auth.login);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [loading, setLoading] = useState({ login: false });

  useEffect(() => {
    if (isAuthenticated) Router.push("/");
  }, [isAuthenticated]);

  function onSubmit(e) {
    e.preventDefault();

    if (loading.login) return null;

    setError("");

    setLoading((s) => ({ ...s, login: true }));
    try {
      // You need to define the login logic here. For now, assuming it redirects to Kivo's OAuth endpoint
      // This could be a redirect to an OAuth provider or similar
      Router.push("http://localhost:3000/api/v2/auth/signin/kivo");
    } catch (error) {
      setError(error.response?.data?.error || "An error occurred.");
    } finally {
      setLoading({ login: false });
    }
  }

const handleKivoAuth = async (e: any) =>{
  try {
    e?.preventDefault();
    const response: any = await axios.get("http://localhost:3000/api/v2/auth/signin/kivo");
    if(response?.data){
      // window.location.href = response.data;
      console.log('data', response?.data);
      window.location.href = response?.data?.data;
    }
    
  } catch (error) {
    console.error("Error in handleKivoAuth:", error);
  }
}

  if (isAuthenticated) {
    return null;
  }


  return (
    <AppWrapper>
      <ColCenterV maxWidth="100%" px={3} flex="0 0 auto" mt={4}>
        {verifying ? (
          <H2 textAlign="center" light>
            A verification email has been sent.
          </H2>
        ) : (
          <LoginForm id="login-form" onSubmit={onSubmit}>
            <Flex justifyContent="center">
              <Button
                flex="1 1 auto"
                height={[44, 56]}
                onClick={handleKivoAuth}
              >
                <Icon
                  name={loading.login ? "spinner" : "login"}
                  stroke="white"
                  mr={2}
                />
                Log in Kivo.ai
              </Button>
              <Button onclick="window.location.href='/signin/kivo'">Login with Kivo</Button>
            </Flex>
            <Text color="red" mt={1} normal>
              {error}
            </Text>
          </LoginForm>
        )}
      </ColCenterV>
    </AppWrapper>
  );
};

export default LoginPage;
