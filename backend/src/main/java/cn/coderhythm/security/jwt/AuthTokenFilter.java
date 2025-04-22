package cn.coderhythm.security.jwt;

import cn.coderhythm.security.service.UserDetailsServiceImpl;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.util.AntPathMatcher;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@Slf4j
public class AuthTokenFilter extends OncePerRequestFilter {
    
    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        final String requestURI = request.getRequestURI();
        log.debug("Processing request: {} {}", request.getMethod(), requestURI);
        
        // Skip authentication for paths that don't need JWT
        if (shouldSkipAuthentication(requestURI)) {
            log.info("Skipping authentication for public endpoint: {}", requestURI);
            filterChain.doFilter(request, response);
            return;
        }
        
        try {
            String jwt = parseJwt(request);
            
            if (jwt != null) {
                log.debug("JWT token found in request for path: {}", requestURI);
                
                if (jwtUtils.validateJwtToken(jwt)) {
                    String username = jwtUtils.getUserNameFromJwtToken(jwt);
                    log.debug("Valid JWT found for user: {}", username);

                    try {
                        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        log.debug("User '{}' authentication set to security context", username);
                    } catch (UsernameNotFoundException e) {
                        log.error("User not found: {}", username);
                        // User doesn't exist, JWT may contain a user that has been deleted
                    }
                } else {
                    log.debug("Invalid JWT token");
                }
            } else {
                log.debug("No JWT token found in request");
            }
        } catch (Exception e) {
            log.error("Cannot set user authentication: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    private boolean shouldSkipAuthentication(String requestURI) {
        AntPathMatcher pathMatcher = new AntPathMatcher();
        return pathMatcher.match("/auth/**", requestURI) || 
               pathMatcher.match("/avatars/**", requestURI) ||
               pathMatcher.match("/resources/**", requestURI);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }

        return null;
    }
} 