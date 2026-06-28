import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';

import { requestToken } from '../api/authApi';
import { useAuthStore } from '../store/authStore';
import { Button } from '@/shared/components/Button';
import { FormField } from '@/shared/components/FormField';

const loginSchema = z.object({
  username: z.string().min(1, 'Username or email is required.'),
  password: z.string().min(1, 'Password is required.')
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const completeSignIn = useAuthStore((state) => state.completeSignIn);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: ''
    }
  });

  const loginMutation = useMutation({
    mutationFn: requestToken,
    onSuccess: completeSignIn
  });

  function onSubmit(values: LoginFormValues) {
    loginMutation.mutate(values);
  }

  return (
    <main className="login-page">
      <section className="login-hero">
        <div className="login-hero-content">
          <div className="login-badge">
            <ShieldCheck size={16} />
            Enterprise Bankruptcy Processing Platform
          </div>

          <h1>Xocket Operations Portal</h1>

          <p>
            Secure access to placement workflows, claims, court filing packages, receipts, NDC payments,
            scrubbing, monitoring, and reporting.
          </p>

          <div className="login-capability-grid">
            <div>Matching Engine</div>
            <div>Decision Engine</div>
            <div>Workflow Engines</div>
            <div>Document Platform</div>
            <div>Event Platform</div>
            <div>Scrubbing Platform</div>
          </div>
        </div>
      </section>

      <section className="login-panel-wrap">
        <form className="login-panel" onSubmit={handleSubmit(onSubmit)}>
          <div className="login-panel-header">
            <div className="login-logo-mark">X</div>
            <div>
              <h2>Sign in</h2>
              <p>Use your Xocket credentials to continue.</p>
            </div>
          </div>

          {loginMutation.error ? <div className="login-error">{loginMutation.error.message}</div> : null}

          <FormField
            id="username"
            label="Username or email"
            placeholder="name@company.com"
            autoComplete="username"
            error={errors.username?.message}
            {...register('username')}
          />

          <FormField
            id="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter password"
            autoComplete="current-password"
            error={errors.password?.message}
            rightSlot={
              <button
                type="button"
                className="login-eye-button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
            {...register('password')}
          />

          <div className="login-options">
            <label>
              <input type="checkbox" />
              Remember this device
            </label>

            <button type="button">Forgot password?</button>
          </div>

          <Button type="submit" className="login-submit" disabled={loginMutation.isPending} icon={<LockKeyhole size={18} />}>
            {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
          </Button>

          <div className="login-security-note">
            JWT authentication, permission-based authorization, correlation logging, and health monitoring are enabled.
          </div>
        </form>
      </section>
    </main>
  );
}
