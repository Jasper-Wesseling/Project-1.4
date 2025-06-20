<?php

namespace App\EventListener;

use Lexik\Bundle\JWTAuthenticationBundle\Event\JWTCreatedEvent;
use Symfony\Component\Security\Core\User\UserInterface;

class JWTLoginListener
{
    public function onJWTCreated(JWTCreatedEvent $event)
    {
        $user = $event->getUser();
        $payload = $event->getData();
        
        if (!$user instanceof UserInterface) {
            return;
        }

        // Get user roles
        $roles = $user->getRoles();
        
        // Set different expiration times based on roles
        $expirationTime = $this->getExpirationTimeByRole($roles);
        
        // Set the expiration time
        $payload['exp'] = time() + $expirationTime;
        
        // Add role information to payload
        $payload['roles'] = $roles;
        $payload['username'] = $user->getUserIdentifier();
        
        $event->setData($payload);
    }
    
    private function getExpirationTimeByRole(array $roles): int
    {
        if (in_array('ROLE_DISABLED', $roles)) {
            return 60*2;
        }

        if (in_array('ROLE_TEMP', $roles)) {
            return 60*60*24;
        }

        if (in_array('ROLE_ADMIN', $roles)) {
            return 60*60*8;
        }

        if (in_array('ROLE_USER', $roles)) {
            return 60*60;
        }
        
        
        
        // Default fallback
        return 3600; // 30 minutes
    }
}